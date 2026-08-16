import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

const D = (): string => new Date().toISOString().slice(0, 10);

function unique(tag: string): string {
  return `${tag}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function uniqueEmail(tag: string): string {
  return `${tag}-${Date.now()}-${Math.floor(Math.random() * 100000)}@e2e.test`;
}

const SUPER_ADMIN_EMAIL = 'super@test.com';
const SUPER_ADMIN_PASSWORD = 'superadmin123';
const TENANT_ADMIN_PASSWORD = 'adminpass123';

async function truncateAll(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    'TRUNCATE tenants, users, exchange_rates, categories, products, stock_adjustments, customers, sales, sale_items, sale_payments, cash_registers RESTART IDENTITY CASCADE',
  );
}

describe('Calidad e2e (PostgreSQL real)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5431';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.DB_DATABASE = 'veccit_pos_test';
    process.env.JWT_SECRET = 'e2e-test-secret';
    process.env.SUPER_ADMIN_EMAIL = SUPER_ADMIN_EMAIL;
    process.env.SUPER_ADMIN_PASSWORD = SUPER_ADMIN_PASSWORD;
    process.env.UPLOADS_DIR = '.e2e-uploads';

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleFixture.get(DataSource);
    expect(dataSource.isInitialized).toBe(true);
    await truncateAll(dataSource);

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // El bootstrap crea el super admin despues de truncar la base.
    const row = await dataSource.query(
      `SELECT count(*)::int AS n FROM users WHERE role = 'SUPER_ADMIN'`,
    );
    expect(row[0].n).toBe(1);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await truncateAll(dataSource);
    }
    await app?.close();
  });

  async function loginAs(
    email: string,
    password: string,
  ): Promise<request.Agent> {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/api/auth/login').send({ email, password }).expect(201);
    return agent;
  }

  async function registerTenant(adminEmail: string): Promise<void> {
    const superAgent = await loginAs(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    await superAgent
      .post('/api/auth/register-tenant')
      .send({
        tenantName: unique('Tienda'),
        email: adminEmail,
        password: TENANT_ADMIN_PASSWORD,
        tenantAdminName: unique('Ana'),
        phone: '+584121234567',
        businessName: unique('Tienda'),
        plan: 'FREE',
      })
      .expect(201);
  }

  async function seedRateAndProduct(
    agent: request.Agent,
  ): Promise<{ productAId: string; productBId: string }> {
    await agent
      .post('/api/rates')
      .send({ rateVES: 32.5, date: D() })
      .expect(201);

    const productA = await agent
      .post('/api/products')
      .send({
        sku: unique('SKU-A'),
        name: 'Producto A',
        priceUSD: 10,
        costUSD: 6,
        stock: 10,
        minStock: 2,
      })
      .expect(201);

    const productB = await agent
      .post('/api/products')
      .send({
        sku: unique('SKU-B'),
        name: 'Producto B',
        priceUSD: 5,
        costUSD: 3,
        stock: 2,
        minStock: 1,
      })
      .expect(201);

    return {
      productAId: productA.body.product.id,
      productBId: productB.body.product.id,
    };
  }

  it('procesa un checkout mixto USD/VES dentro de una transaccion ACID', async () => {
    const adminEmail = uniqueEmail('admin');
    await registerTenant(adminEmail);
    const agent = await loginAs(adminEmail, TENANT_ADMIN_PASSWORD);
    const { productAId } = await seedRateAndProduct(agent);

    await agent
      .post('/api/cash-registers/open')
      .send({ openingAmountUSD: 50 })
      .expect(201);

    const res = await agent
      .post('/api/sales')
      .send({
        items: [{ productId: productAId, quantity: 2 }],
        payments: [
          { paymentMethod: 'CASH_USD', amount: 10, currency: 'USD' },
          { paymentMethod: 'PAGO_MOVIL_VES', amount: 325, currency: 'VES' },
        ],
      })
      .expect(201);

    expect(res.body.sale.totalUSD).toBe(20);
    expect(res.body.sale.totalVES).toBe(650);
    expect(res.body.sale.status).toBe('COMPLETED');

    const products = await agent.get('/api/products').expect(200);
    const updated = products.body.products.find(
      (p: { id: string }) => p.id === productAId,
    );
    expect(updated.stock).toBe(8);
  });

  it('hace rollback ACID cuando un item no tiene stock suficiente', async () => {
    const adminEmail = uniqueEmail('admin');
    await registerTenant(adminEmail);
    const agent = await loginAs(adminEmail, TENANT_ADMIN_PASSWORD);
    const { productAId, productBId } = await seedRateAndProduct(agent);

    // El pago cuadra con el total (10 + 15 = 25 USD), pero el producto B
    // no tiene stock para 3 unidades: el descuento de A se debe revertir.
    const res = await agent.post('/api/sales').send({
      items: [
        { productId: productAId, quantity: 1 },
        { productId: productBId, quantity: 3 },
      ],
      payments: [{ paymentMethod: 'CASH_USD', amount: 25, currency: 'USD' }],
    });
    expect(res.status).toBe(500);

    const after = await agent.get('/api/products').expect(200);
    const productA = after.body.products.find(
      (p: { id: string }) => p.id === productAId,
    );
    const productB = after.body.products.find(
      (p: { id: string }) => p.id === productBId,
    );
    expect(productA.stock).toBe(10);
    expect(productB.stock).toBe(2);

    const sales = await agent.get('/api/sales').expect(200);
    expect(sales.body.sales).toHaveLength(0);
  });

  it('reposiciona el stock al anular una venta (void)', async () => {
    const adminEmail = uniqueEmail('admin');
    await registerTenant(adminEmail);
    const agent = await loginAs(adminEmail, TENANT_ADMIN_PASSWORD);
    const { productAId } = await seedRateAndProduct(agent);

    await agent
      .post('/api/cash-registers/open')
      .send({ openingAmountUSD: 50 })
      .expect(201);

    const saleRes = await agent
      .post('/api/sales')
      .send({
        items: [{ productId: productAId, quantity: 3 }],
        payments: [{ paymentMethod: 'CASH_USD', amount: 30, currency: 'USD' }],
      })
      .expect(201);
    const saleId = saleRes.body.sale.id;

    await agent
      .post(`/api/sales/${saleId}/void`)
      .send({ reason: 'Anulacion por error del cajero' })
      .expect(201);

    const after = await agent.get('/api/products').expect(200);
    const product = after.body.products.find(
      (p: { id: string }) => p.id === productAId,
    );
    expect(product.stock).toBe(10);

    const salesRes = await agent.get('/api/sales').expect(200);
    const voided = salesRes.body.sales.find(
      (s: { id: string }) => s.id === saleId,
    );
    expect(voided.status).toBe('VOIDED');
  });

  it('no expone el avatar de usuario de otro tenant (404 cross-tenant)', async () => {
    const emailA = uniqueEmail('adminA');
    const emailB = uniqueEmail('adminB');
    await registerTenant(emailA);
    await registerTenant(emailB);

    const agentA = await loginAs(emailA, TENANT_ADMIN_PASSWORD);
    const agentB = await loginAs(emailB, TENANT_ADMIN_PASSWORD);

    const meA = await agentA.get('/api/auth/me').expect(200);
    const userIdA = meA.body.user.id as string;
    const meB = await agentB.get('/api/auth/me').expect(200);
    const tenantIdB = meB.body.user.tenantId as string;

    // Con su propio tenant en la URL, el tenant B intenta leer el avatar
    // de un usuario del tenant A: no debe encontrarlo (aislamiento).
    const res = await agentB
      .get(`/api/uploads/avatars/${tenantIdB}/${userIdA}.png`)
      .expect(404);
    expect(res.body.statusCode).toBe(404);
  });
});

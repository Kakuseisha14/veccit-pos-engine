import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5431';
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.DB_DATABASE = 'veccit_pos_test';
    process.env.JWT_SECRET = 'e2e-test-secret';
    process.env.SUPER_ADMIN_EMAIL = 'super@test.com';
    process.env.SUPER_ADMIN_PASSWORD = 'superadmin123';
    process.env.UPLOADS_DIR = '.e2e-uploads';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(helmet());
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('aplica helmet: no expone cabeceras sensibles (x-powered-by)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-powered-by']).toBeUndefined();
        expect(res.headers['x-content-type-options']).toBe('nosniff');
      });
  });

  it('aplica rate limiting con ThrottlerGuard (429 tras exceder el limite)', async () => {
    const limit = 100;
    for (let i = 0; i < limit; i += 1) {
      await request(app.getHttpServer()).get('/api/health').expect(200);
    }
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(429);
  });

  it('rechaza mutaciones con un Origin foraneo (proteccion CSRF)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', 'https://evil.example.com')
      .send({ email: 'nobody@example.com', password: '12345678' });
    expect(res.status).toBe(403);
  });
});

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSales1727000000000 implements MigrationInterface {
  name = 'CreateSales1727000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL,
        "tenantId" uuid NOT NULL,
        "identification" character varying(30) NOT NULL,
        "name" character varying(160) NOT NULL,
        "email" character varying(160),
        "phone" character varying(30),
        "address" character varying(300),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customers_tenant_identification" UNIQUE ("tenantId", "identification")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_customers_tenant_id" ON "customers" ("tenantId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid NOT NULL,
        "tenantId" uuid NOT NULL,
        "saleNumber" character varying(30) NOT NULL,
        "customerId" uuid,
        "userId" uuid NOT NULL,
        "subtotalUSD" numeric(12,2) NOT NULL,
        "taxUSD" numeric(12,2) NOT NULL DEFAULT 0,
        "totalUSD" numeric(12,2) NOT NULL,
        "exchangeRateVES" numeric(14,4) NOT NULL,
        "totalVES" numeric(12,2) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'COMPLETED',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sales" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sales_tenant_number" UNIQUE ("tenantId", "saleNumber"),
        CONSTRAINT "FK_sales_customer" FOREIGN KEY ("customerId")
          REFERENCES "customers"("id"),
        CONSTRAINT "FK_sales_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_sales_tenant_id" ON "sales" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sales_tenant_created" ON "sales" ("tenantId", "createdAt")`,
    );

    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        "id" uuid NOT NULL,
        "saleId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "productName" character varying(120) NOT NULL,
        "productSku" character varying(40) NOT NULL,
        "quantity" integer NOT NULL,
        "unitPriceUSD" numeric(12,2) NOT NULL,
        "subtotalUSD" numeric(12,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sale_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sale_items_sale" FOREIGN KEY ("saleId")
          REFERENCES "sales"("id"),
        CONSTRAINT "FK_sale_items_product" FOREIGN KEY ("productId")
          REFERENCES "products"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_sale_items_sale_id" ON "sale_items" ("saleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sale_items_product_id" ON "sale_items" ("productId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "sale_payments" (
        "id" uuid NOT NULL,
        "saleId" uuid NOT NULL,
        "paymentMethod" character varying(30) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "currency" character varying(3) NOT NULL,
        "exchangeRateVES" numeric(14,4) NOT NULL,
        "amountUSD" numeric(12,2) NOT NULL,
        "reference" character varying(100),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sale_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sale_payments_sale" FOREIGN KEY ("saleId")
          REFERENCES "sales"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_sale_payments_sale_id" ON "sale_payments" ("saleId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sale_payments"`);
    await queryRunner.query(`DROP TABLE "sale_items"`);
    await queryRunner.query(`DROP TABLE "sales"`);
    await queryRunner.query(`DROP TABLE "customers"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventory1725000000000 implements MigrationInterface {
  name = 'CreateInventory1725000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL,
        "tenantId" uuid NOT NULL,
        "name" character varying(80) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_tenant_name" UNIQUE ("tenantId", "name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL,
        "tenantId" uuid NOT NULL,
        "sku" character varying(40) NOT NULL,
        "name" character varying(120) NOT NULL,
        "description" character varying(500),
        "priceUSD" numeric(12,2) NOT NULL,
        "costUSD" numeric(12,2) NOT NULL DEFAULT 0,
        "stock" integer NOT NULL DEFAULT 0,
        "minStock" integer NOT NULL DEFAULT 0,
        "categoryId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_tenant_sku" UNIQUE ("tenantId", "sku"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("categoryId")
          REFERENCES "categories"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_products_tenant_id" ON "products" ("tenantId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "stock_adjustments" (
        "id" uuid NOT NULL,
        "tenantId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "reason" character varying(300) NOT NULL,
        "performedById" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_adjustments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_stock_adjustments_product" FOREIGN KEY ("productId")
          REFERENCES "products"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_stock_adjustments_tenant_product" ON "stock_adjustments" ("tenantId", "productId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stock_adjustments"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}

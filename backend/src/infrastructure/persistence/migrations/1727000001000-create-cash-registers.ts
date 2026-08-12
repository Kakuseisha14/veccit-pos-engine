import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCashRegisters1727000001000 implements MigrationInterface {
  name = 'CreateCashRegisters1727000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cash_registers" (
        "id" uuid NOT NULL,
        "tenantId" uuid NOT NULL,
        "cashierId" uuid NOT NULL,
        "openingAmountUSD" numeric(12,2) NOT NULL,
        "openedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "status" character varying(10) NOT NULL DEFAULT 'OPEN',
        "closedAt" TIMESTAMP,
        "closingAmountUSD" numeric(12,2),
        "expectedCashUSD" numeric(12,2),
        "differenceUSD" numeric(12,2),
        "notes" character varying(300),
        CONSTRAINT "PK_cash_registers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cash_registers_cashier" FOREIGN KEY ("cashierId")
          REFERENCES "users"("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_cash_registers_tenant_id" ON "cash_registers" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cash_registers_tenant_opened" ON "cash_registers" ("tenantId", "openedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cash_registers_tenant_cashier_status" ON "cash_registers" ("tenantId", "cashierId", "status")`,
    );

    await queryRunner.query(`
      ALTER TABLE "sales"
        ADD COLUMN "shiftId" uuid,
        ADD COLUMN "voidedAt" TIMESTAMP,
        ADD COLUMN "voidedByUserId" uuid,
        ADD COLUMN "voidReason" character varying(300)
    `);

    await queryRunner.query(`
      ALTER TABLE "sales"
        ADD CONSTRAINT "FK_sales_shift" FOREIGN KEY ("shiftId")
          REFERENCES "cash_registers"("id")
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_sales_tenant_shift" ON "sales" ("tenantId", "shiftId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_sales_tenant_shift"`);
    await queryRunner.query(
      `ALTER TABLE "sales" DROP CONSTRAINT "FK_sales_shift"`,
    );
    await queryRunner.query(`
      ALTER TABLE "sales"
        DROP COLUMN "shiftId",
        DROP COLUMN "voidedAt",
        DROP COLUMN "voidedByUserId",
        DROP COLUMN "voidReason"
    `);
    await queryRunner.query(`DROP TABLE "cash_registers"`);
  }
}

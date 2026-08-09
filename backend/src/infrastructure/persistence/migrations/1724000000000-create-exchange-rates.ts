import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExchangeRates1724000000000 implements MigrationInterface {
  name = 'CreateExchangeRates1724000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "exchange_rates" (
        "id" uuid NOT NULL,
        "tenantId" uuid NOT NULL,
        "rateVES" numeric(12,2) NOT NULL,
        "date" date NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exchange_rates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_exchange_rates_tenant_date" UNIQUE ("tenantId", "date")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "exchange_rates"`);
  }
}

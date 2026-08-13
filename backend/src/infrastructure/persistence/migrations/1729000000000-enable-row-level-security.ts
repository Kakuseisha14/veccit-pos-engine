import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableRowLevelSecurity1729000000000 implements MigrationInterface {
  name = 'EnableRowLevelSecurity1729000000000';

  private readonly tables = [
    'users',
    'exchange_rates',
    'categories',
    'products',
    'stock_adjustments',
    'customers',
    'sales',
    'cash_registers',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.tables) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`,
      );
      await queryRunner.query(`
        CREATE POLICY "${table}_tenant_isolation" ON "${table}"
          USING ("tenantId"::text = NULLIF(current_setting('app.current_tenant_id', true), '') OR NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL)
          WITH CHECK ("tenantId"::text = NULLIF(current_setting('app.current_tenant_id', true), '') OR NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL);
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.tables) {
      await queryRunner.query(
        `DROP POLICY IF EXISTS "${table}_tenant_isolation" ON "${table}";`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`,
      );
    }
  }
}

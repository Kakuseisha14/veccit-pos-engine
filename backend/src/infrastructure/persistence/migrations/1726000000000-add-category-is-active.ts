import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryIsActive1726000000000 implements MigrationInterface {
  name = 'AddCategoryIsActive1726000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "categories" ADD "isActive" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "isActive"`);
  }
}

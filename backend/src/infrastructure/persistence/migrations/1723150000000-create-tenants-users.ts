import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantsUsers1723150000000 implements MigrationInterface {
  name = 'CreateTenantsUsers1723150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "email" character varying(190) NOT NULL,
        "phone" character varying(30),
        "businessName" character varying(120),
        "plan" character varying(20) NOT NULL DEFAULT 'FREE',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenants_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "tenantId" uuid,
        "name" character varying(120) NOT NULL,
        "email" character varying(190) NOT NULL,
        "passwordHash" character varying(255) NOT NULL,
        "role" character varying(20) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_users_tenant_id" ON "users" ("tenantId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}

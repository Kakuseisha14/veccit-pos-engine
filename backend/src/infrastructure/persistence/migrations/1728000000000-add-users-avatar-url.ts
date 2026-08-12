import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersAvatarUrl1728000000000 implements MigrationInterface {
  name = 'AddUsersAvatarUrl1728000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatarUrl" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
  }
}

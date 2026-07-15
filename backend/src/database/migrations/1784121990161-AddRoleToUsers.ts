import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToUsers1784121990161 implements MigrationInterface {
    name = 'AddRoleToUsers1784121990161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" nvarchar(50) NOT NULL CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'user'`);
        await queryRunner.renameColumn('users', 'id', 'UniqueId');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" ntext NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'user' FOR "role"`);
        await queryRunner.renameColumn('users', 'UniqueId', 'id');
    }

}

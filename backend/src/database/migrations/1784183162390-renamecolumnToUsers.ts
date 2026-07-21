import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamecolumnToUsers1784183162390 implements MigrationInterface {
    name = 'RenamecolumnToUsers1784183162390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`EXEC sp_rename "typeorm_db.dbo.users.email", "Gmail"`);
        await queryRunner.query(`EXEC sp_rename "typeorm_db.dbo.users.UQ_97672ac88f789774dd47f7c8be3", "UQ_b6ca62665c24dbbc72c692a16d1"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'user' FOR "role"`);
        await queryRunner.query(`EXEC sp_rename "typeorm_db.dbo.users.UQ_b6ca62665c24dbbc72c692a16d1", "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`EXEC sp_rename "typeorm_db.dbo.users.Gmail", "email"`);
    }

}

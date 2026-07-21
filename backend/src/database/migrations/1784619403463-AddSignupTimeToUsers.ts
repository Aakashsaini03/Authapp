import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSignupTimeToUsers1784619403463 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD signup_at DATETIME2 NULL`);
        await queryRunner.query(`
            CREATE TRIGGER addsignup_time
            on users
            AFTER INSERT
            as
            begin
              SET NOCOUNT ON;
              UPDATE u
              SET u.signup_at=SYSDATETIME()
              FROM users AS u
             WHERE u.signup_at IS NULL;
            END
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN signup_at`);
        await queryRunner.query(`
      DROP TRIGGER IF EXISTS addsignup_time
    `);
    }

}

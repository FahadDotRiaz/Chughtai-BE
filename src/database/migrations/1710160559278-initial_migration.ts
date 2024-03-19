import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1710160559278 implements MigrationInterface {
    name = 'InitialMigration1710160559278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" ADD "isReview" boolean DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" DROP COLUMN "isReview"`);
    }

}

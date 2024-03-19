import { MigrationInterface, QueryRunner } from "typeorm";

export class IsBatchColumns1710740384882 implements MigrationInterface {
    name = 'IsBatchColumns1710740384882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_grn" ADD "isBatch" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "item_grn" ADD "expireDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "item_grn" ADD "manufacturedDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "item_grn" ADD "batchNo" character varying`);
        await queryRunner.query(`ALTER TABLE "item_inventory" ADD "isBatch" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "item_inventory" ADD "expireDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "item_inventory" ADD "manufacturedDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "item_inventory" ADD "batchNo" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_inventory" DROP COLUMN "batchNo"`);
        await queryRunner.query(`ALTER TABLE "item_inventory" DROP COLUMN "manufacturedDate"`);
        await queryRunner.query(`ALTER TABLE "item_inventory" DROP COLUMN "expireDate"`);
        await queryRunner.query(`ALTER TABLE "item_inventory" DROP COLUMN "isBatch"`);
        await queryRunner.query(`ALTER TABLE "item_grn" DROP COLUMN "batchNo"`);
        await queryRunner.query(`ALTER TABLE "item_grn" DROP COLUMN "manufacturedDate"`);
        await queryRunner.query(`ALTER TABLE "item_grn" DROP COLUMN "expireDate"`);
        await queryRunner.query(`ALTER TABLE "item_grn" DROP COLUMN "isBatch"`);
    }

}

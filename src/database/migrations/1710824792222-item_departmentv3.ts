import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemDepartmentv31710824792222 implements MigrationInterface {
    name = 'ItemDepartmentv31710824792222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "return_item_request" ADD "rejectedReason" character varying`);
        await queryRunner.query(`ALTER TABLE "item_request" ADD "rejectedReason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_request" DROP COLUMN "rejectedReason"`);
        await queryRunner.query(`ALTER TABLE "return_item_request" DROP COLUMN "rejectedReason"`);
    }

}

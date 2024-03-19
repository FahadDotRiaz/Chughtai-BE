import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemDepartmentv21710823556619 implements MigrationInterface {
    name = 'ItemDepartmentv21710823556619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."return_request_items_suggestedtype_enum" AS ENUM('Return', 'Disposal')`);
        await queryRunner.query(`ALTER TABLE "return_request_items" ADD "suggestedType" "public"."return_request_items_suggestedtype_enum"`);
        await queryRunner.query(`ALTER TABLE "return_request_items" ADD "suggestedQty" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "return_request_items" DROP COLUMN "suggestedQty"`);
        await queryRunner.query(`ALTER TABLE "return_request_items" DROP COLUMN "suggestedType"`);
        await queryRunner.query(`DROP TYPE "public"."return_request_items_suggestedtype_enum"`);
    }

}

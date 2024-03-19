import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemDepartment1710746240521 implements MigrationInterface {
    name = 'ItemDepartment1710746240521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item" ADD "department_id" uuid`);
        await queryRunner.query(`ALTER TABLE "item_request_items" ADD "suggestedQty" integer`);
        await queryRunner.query(`ALTER TABLE "item_request_items" ADD "suggestedItem_id" uuid`);
        await queryRunner.query(`ALTER TABLE "department" ADD "mirItemReview" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "department" ADD "mrrItemReview" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TYPE "public"."return_item_request_stage_enum" RENAME TO "return_item_request_stage_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."return_item_request_stage_enum" AS ENUM('HOD_APPROVAL', 'STORE_APPROVAL', 'DEPARTMENT_APPROVAL', 'COMPLETED', 'PARTIAL_COMPLETE')`);
        await queryRunner.query(`ALTER TABLE "return_item_request" ALTER COLUMN "stage" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "return_item_request" ALTER COLUMN "stage" TYPE "public"."return_item_request_stage_enum" USING "stage"::"text"::"public"."return_item_request_stage_enum"`);
        await queryRunner.query(`ALTER TABLE "return_item_request" ALTER COLUMN "stage" SET DEFAULT 'STORE_APPROVAL'`);
        await queryRunner.query(`DROP TYPE "public"."return_item_request_stage_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."item_request_stage_enum" RENAME TO "item_request_stage_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."item_request_stage_enum" AS ENUM('HOD_APPROVAL', 'STORE_APPROVAL', 'DEPARTMENT_APPROVAL', 'COMPLETED', 'PARTIAL_COMPLETE')`);
        await queryRunner.query(`ALTER TABLE "item_request" ALTER COLUMN "stage" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "item_request" ALTER COLUMN "stage" TYPE "public"."item_request_stage_enum" USING "stage"::"text"::"public"."item_request_stage_enum"`);
        await queryRunner.query(`ALTER TABLE "item_request" ALTER COLUMN "stage" SET DEFAULT 'HOD_APPROVAL'`);
        await queryRunner.query(`DROP TYPE "public"."item_request_stage_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."department_type_enum" RENAME TO "department_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."department_type_enum" AS ENUM('Store', 'SubStore', 'IT', 'Maintenance', 'Others')`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "type" TYPE "public"."department_type_enum" USING "type"::"text"::"public"."department_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."department_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "item" ADD CONSTRAINT "FK_f7ae22e4ddd407bd97ddf40dfec" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_request_items" ADD CONSTRAINT "FK_1355740300ae5a3e5e2f49ef971" FOREIGN KEY ("suggestedItem_id") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item_request_items" DROP CONSTRAINT "FK_1355740300ae5a3e5e2f49ef971"`);
        await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_f7ae22e4ddd407bd97ddf40dfec"`);
        await queryRunner.query(`CREATE TYPE "public"."department_type_enum_old" AS ENUM('Store', 'SubStore', 'Others')`);
        await queryRunner.query(`ALTER TABLE "department" ALTER COLUMN "type" TYPE "public"."department_type_enum_old" USING "type"::"text"::"public"."department_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."department_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."department_type_enum_old" RENAME TO "department_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."item_request_stage_enum_old" AS ENUM('HOD_APPROVAL', 'STORE_APPROVAL', 'COMPLETED', 'PARTIAL_COMPLETE')`);
        await queryRunner.query(`ALTER TABLE "item_request" ALTER COLUMN "stage" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "item_request" ALTER COLUMN "stage" TYPE "public"."item_request_stage_enum_old" USING "stage"::"text"::"public"."item_request_stage_enum_old"`);
        await queryRunner.query(`ALTER TABLE "item_request" ALTER COLUMN "stage" SET DEFAULT 'HOD_APPROVAL'`);
        await queryRunner.query(`DROP TYPE "public"."item_request_stage_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."item_request_stage_enum_old" RENAME TO "item_request_stage_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."return_item_request_stage_enum_old" AS ENUM('HOD_APPROVAL', 'STORE_APPROVAL', 'COMPLETED', 'PARTIAL_COMPLETE')`);
        await queryRunner.query(`ALTER TABLE "return_item_request" ALTER COLUMN "stage" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "return_item_request" ALTER COLUMN "stage" TYPE "public"."return_item_request_stage_enum_old" USING "stage"::"text"::"public"."return_item_request_stage_enum_old"`);
        await queryRunner.query(`ALTER TABLE "return_item_request" ALTER COLUMN "stage" SET DEFAULT 'STORE_APPROVAL'`);
        await queryRunner.query(`DROP TYPE "public"."return_item_request_stage_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."return_item_request_stage_enum_old" RENAME TO "return_item_request_stage_enum"`);
        await queryRunner.query(`ALTER TABLE "department" DROP COLUMN "mrrItemReview"`);
        await queryRunner.query(`ALTER TABLE "department" DROP COLUMN "mirItemReview"`);
        await queryRunner.query(`ALTER TABLE "item_request_items" DROP COLUMN "suggestedItem_id"`);
        await queryRunner.query(`ALTER TABLE "item_request_items" DROP COLUMN "suggestedQty"`);
        await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "department_id"`);
    }

}

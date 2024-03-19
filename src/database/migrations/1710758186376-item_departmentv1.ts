import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemDepartmentv11710758186376 implements MigrationInterface {
    name = 'ItemDepartmentv11710758186376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking" ADD "isItemReview" boolean DEFAULT true`);
        await queryRunner.query(`ALTER TYPE "public"."tracking_action_enum" RENAME TO "tracking_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tracking_action_enum" AS ENUM('USER_CREATED', 'USER_UPDATED', 'HOD_APPROVED', 'HOD_REJECTED', 'STORE_ISSUED', 'STORE_ACCEPT', ' ITEM_HOD_REVIEWED ')`);
        await queryRunner.query(`ALTER TABLE "tracking" ALTER COLUMN "action" TYPE "public"."tracking_action_enum" USING "action"::"text"::"public"."tracking_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tracking_action_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tracking_action_enum_old" AS ENUM('USER_CREATED', 'USER_UPDATED', 'HOD_APPROVED', 'HOD_REJECTED', 'STORE_ISSUED', 'STORE_ACCEPT')`);
        await queryRunner.query(`ALTER TABLE "tracking" ALTER COLUMN "action" TYPE "public"."tracking_action_enum_old" USING "action"::"text"::"public"."tracking_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."tracking_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tracking_action_enum_old" RENAME TO "tracking_action_enum"`);
        await queryRunner.query(`ALTER TABLE "tracking" DROP COLUMN "isItemReview"`);
    }

}

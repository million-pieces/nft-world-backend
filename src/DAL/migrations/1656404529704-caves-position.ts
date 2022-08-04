import {MigrationInterface, QueryRunner} from "typeorm";

export class cavesPosition1656404529704 implements MigrationInterface {
    name = 'cavesPosition1656404529704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Civilization_Cave" ADD "position" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Civilization_Cave" DROP COLUMN "position"`);
    }

}

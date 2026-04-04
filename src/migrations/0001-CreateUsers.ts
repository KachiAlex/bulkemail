import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateUsers0001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'text' },
          { name: 'firstName', type: 'varchar' },
          { name: 'lastName', type: 'varchar' },
          { name: 'phone', type: 'varchar', isNullable: true },
          {
            name: 'role',
            type: 'varchar',
            default: `'sales_rep'`,
          },
          {
            name: 'status',
            type: 'varchar',
            default: `'active'`,
          },
          { name: 'avatar', type: 'varchar', isNullable: true },
          { name: 'department', type: 'varchar', isNullable: true },
          { name: 'preferences', type: 'jsonb', default: `'{}'` },
          { name: 'permissions', type: 'jsonb', default: `'[]'` },
          { name: 'emailVerified', type: 'boolean', default: false },
          { name: 'refreshToken', type: 'text', isNullable: true, default: null },
          { name: 'lastLoginAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}

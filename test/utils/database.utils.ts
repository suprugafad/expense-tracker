import { DataSource } from 'typeorm';

export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);

    if (entity.tableName === 'categories') {
      await repository.query(`DELETE FROM categories;`);
    }
  }

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);

    if (entity.tableName !== 'categories') {
      await repository.query(`DELETE FROM ${entity.tableName};`);
    }
  }
}

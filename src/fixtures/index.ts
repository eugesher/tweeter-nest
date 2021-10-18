import { config } from 'dotenv';
import { join, resolve } from 'path';
import {
  Builder,
  fixturesIterator,
  IEntity,
  Loader,
  Parser,
  Resolver,
} from 'typeorm-fixtures-cli/dist';
import { createConnection, getRepository } from 'typeorm';
import ormconfig from '../config/ormconfig';

config();

const isDuplicateUser = async (entity: IEntity): Promise<boolean> => {
  const userByUsername = await getRepository(entity.constructor.name).findOne({
    username: entity.username,
  });

  if (Boolean(userByUsername)) {
    return true;
  }

  const userByEmail = await getRepository(entity.constructor.name).findOne({
    email: entity.email,
  });

  return Boolean(userByEmail);
};

async function loadFixtures(fixturesPath: string): Promise<void> {
  let connection;

  try {
    connection = await createConnection(ormconfig);

    const loader = new Loader();
    loader.load(resolve(fixturesPath));

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(connection, new Parser());

    let counter = 0;
    for (const fixture of fixturesIterator(fixtures)) {
      fixture.locale = 'en_US';
      const entity = await builder.build(fixture);

      if (entity.constructor.name === 'User') {
        if (await isDuplicateUser(entity)) {
          counter++;
          continue;
        }
      }

      await getRepository(entity.constructor.name).save(entity);
      counter++;
      console.clear();
      console.log(
        `${entity.constructor.name} loaded (${counter}/${fixtures.length})`,
      );
    }
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

loadFixtures(join(__dirname, 'config'))
  .then(() => {
    console.clear();
    console.log('Fixtures are successfully loaded.');
  })
  .catch((err) => console.log(err));

import { config } from 'dotenv';
import * as path from 'path';
import {
  Builder,
  fixturesIterator,
  Loader,
  Parser,
  Resolver,
} from 'typeorm-fixtures-cli/dist';
import { createConnection, getRepository } from 'typeorm';
import ormconfig from './src/ormconfig';

config();

async function loadFixtures(fixturesPath: string): Promise<void> {
  let connection;

  try {
    connection = await createConnection(ormconfig);

    const loader = new Loader();
    loader.load(path.resolve(fixturesPath));

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(connection, new Parser());
    const skippedMessage = 'Skipped due unique condition';

    let counter = 0;
    for (const fixture of fixturesIterator(fixtures)) {
      fixture.locale = 'en_US';
      const entity = await builder.build(fixture);

      if (entity.constructor.name === 'User') {
        const userByUsername = await getRepository(
          entity.constructor.name,
        ).findOne({ username: entity.username });

        if (Boolean(userByUsername)) {
          console.log(skippedMessage);
          counter++;
          continue;
        }

        const userByEmail = await getRepository(
          entity.constructor.name,
        ).findOne({ email: entity.email });

        if (Boolean(userByEmail)) {
          console.log(skippedMessage);
          counter++;
          continue;
        }
      }

      await getRepository(entity.constructor.name).save(entity);
      counter++;
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

loadFixtures('./fixtures')
  .then(() => {
    console.log('Fixtures are successfully loaded.');
  })
  .catch((err) => console.log(err));

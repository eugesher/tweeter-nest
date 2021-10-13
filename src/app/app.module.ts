import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './users/middlewares/auth.middleware';
import { UsersModule } from './users/users.module';
import { TweetsModule } from './tweets/tweets.module';
import ormconfig from '../config/ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), UsersModule, TweetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

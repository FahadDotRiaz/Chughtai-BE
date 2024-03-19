// import { Injectable, Inject } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { config } from 'dotenv';
// import { DataSource, DataSourceOptions } from 'typeorm';

// config();
// @Injectable()
// export class TypeOrmConfigService implements TypeOrmOptionsFactory {
//   @Inject(ConfigService)
//   private readonly config: ConfigService;

//   public createTypeOrmOptions(): TypeOrmModuleOptions {
//     return {
//       applicationName:
//         this.config.get<string>('NODE_ENV') === 'DEV' ? 'chughtai' : 'chughtai',
//       type: 'postgres',
//       host: this.config.get<string>('DATABASE_HOST'),
//       port: this.config.get<number>('DATABASE_PORT'),
//       username: this.config.get<string>('DATABASE_USER_NAME'),
//       password: this.config.get<string>('DATABASE_PASSWORD'),
//       database: this.config.get<string>('DATABASE_NAME'),
//       autoLoadEntities: true,
//       maxQueryExecutionTime: 1000,
//       cache: false,
//       logging: 'all',
//       logger: 'advanced-console',
//       entities: [__dirname + '/../**/entities/*.{ts,js}'],
//       migrations: [__dirname + '/../**/migrations/**/*{.ts,.js}'],
//       migrationsTableName: 'typeorm_migrations',
//       synchronize: false, // never use TRUE in production!
//       ssl: false,
//     };
//   }
// }

// const configuration = new ConfigService();
// console.log('database name', configuration.get<string>('DATABASE_NAME'));
// export const dataSourceOptions: DataSourceOptions = {
//   type: 'postgres',
//   host: configuration.get<string>('DATABASE_HOST'),
//   port: configuration.get<number>('DATABASE_PORT'),
//   username: configuration.get<string>('DATABASE_USER'),
//   password: configuration.get<string>('DATABASE_PASSWORD'),
//   database: configuration.get<string>('DATABASE_NAME'),
//   cache: false,
//   entities: [__dirname + '/../**/entities/*.{ts,js}'],
//   migrations: [__dirname + '/../**/migrations/**/*{.ts,.js}'],
//   migrationsTableName: 'typeorm_migrations',
//   maxQueryExecutionTime: 300,
//   ssl: false,
// };

// const dataSource = new DataSource(dataSourceOptions);
// export default dataSource;

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  private readonly config: ConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    console.log('database name', this.config.get<string>('DATABASE_NAME'));
    const prod = this.config.get<string>('NODE_ENV') === 'PROD';
    return {
      applicationName: prod ? 'Chughtai-prod-be' : 'Chughtai-dev-be',
      type: 'postgres',
      host: this.config.get<string>('DATABASE_HOST'),
      port: this.config.get<number>('DATABASE_PORT'),
      username: this.config.get<string>('DATABASE_USER_NAME'),
      password: this.config.get<string>('DATABASE_PASSWORD'),
      database: this.config.get<string>('DATABASE_NAME'),
      autoLoadEntities: true,
      maxQueryExecutionTime: 1000,
      cache: false,
      logging: prod ? 'all' : ['query', 'error', 'log'],
      logger: 'advanced-console',
      entities: [__dirname + '/../**/entities/*.{ts,js}'],
      migrations: [__dirname + '/../**/migrations/**/*{.ts,.js}'],
      migrationsTableName: 'typeorm_migrations',
      synchronize: false, // never use TRUE in production!
      ssl: false,
      connectTimeoutMS: 3000,
    };
  }
}

const configuration = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configuration.get<string>('DATABASE_HOST'),
  port: configuration.get<number>('DATABASE_PORT'),
  username: configuration.get<string>('DATABASE_USER_NAME'),
  password: configuration.get<string>('DATABASE_PASSWORD'),
  database: configuration.get<string>('DATABASE_NAME'),
  cache: false,
  entities: [__dirname + '/../**/entities/*.{ts,js}'],
  migrations: [__dirname + '/../**/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  maxQueryExecutionTime: 300,
  ssl: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

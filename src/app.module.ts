import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfigService } from './config/db.service';
import { ItemModule } from './item/item.module';
import { ItemRequestModule } from './itemRequest/itemRequest.module';
import { MulterModule } from '@nestjs/platform-express';
import { AwsService } from './config/aws.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { LocationModule } from './location/location.module';
import { DepartmentModule } from './department/department.module';
import { FeatureModule } from './feature/feature.module';
import { RoleTemplateModule } from './role-template/role-template.module';
import { ItemReturnRequestModule } from './returnItemRequest/returnItem.modue';
import { StoreIssuedNoteModule } from './sin/sin.module';
import { PurchaseOrderModule } from './purchaseOrder/purchase-order.module';
import { VendorModule } from './vendor/vendor.module';
import { PurchaseRequestModule } from './purchaseRequest/purchase-request.module';
import { GatePassModule } from './gatePass/gate-pass.module';
import { InventoryModule } from './inventory/inventory.module';
import { ConsumptionModule } from './consumption/consumption.module';
import { GrnModule } from './grn/grn.module';
import { ProvinceModule } from './province/province.module';
import { CityModule } from './city/city.module';
import { AreaModule } from './area/area.module';
import { TrackingModule } from './tracking/tracking.module';
import { CountryModule } from './country/country.module';
import { NotificationModule } from './notification/notification.module';
import { RackModule } from './rack/rack.module';
import { CategoryModule } from './category/category.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     applicationName:
    //       configService.get<string>('NODE_ENV') === 'PROD'
    //         ? 'chughtai-prod-be'
    //         : 'chughtai-dev-be',
    //     type: 'postgres',
    //     host: configService.get('DATABASE_HOST'),
    //     port: +configService.get('DATABASE_PORT'),
    //     username: configService.get('DATABASE_USER_NAME'),
    //     password: configService.get('DATABASE_PASSWORD'),
    //     database: configService.get('DATABASE_NAME'),
    //     entities: [],
    //     logging:
    //       configService.get<string>('NODE_ENV') === 'PROD'
    //         ? 'all'
    //         : ['query', 'error', 'log'],
    //     logger: 'advanced-console',
    //     synchronize: false,
    //     autoLoadEntities: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    ItemModule,
    ItemRequestModule,
    UsersModule,
    DepartmentModule,
    FileUploadModule,
    LocationModule,
    AuthModule,
    ItemReturnRequestModule,
    StoreIssuedNoteModule,
    FeatureModule,
    VendorModule,
    RoleTemplateModule,
    PurchaseOrderModule,
    GatePassModule,
    PurchaseRequestModule,
    InventoryModule,
    ConsumptionModule,
    GrnModule,
    ProvinceModule,
    CityModule,
    TrackingModule,
    AreaModule,
    RackModule,
    CategoryModule,
    CountryModule,
    NotificationModule,
    EmailModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AwsService],
})
export class AppModule {}

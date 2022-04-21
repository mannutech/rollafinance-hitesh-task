import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletManagerService } from './services/wallet-manager/wallet-manager.service';
import { HttpModule } from './http/http.module';
import { GetBalancesService } from './services/scheduled/get-balances/get-balances.service';
import { GetTransactionsService } from './services/scheduled/get-transactions/get-transactions.service';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [TypeOrmModule.forRoot({
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "postgres",
    "database": "postgres",
    "schema": "public",
    "migrationsRun": true,
    "migrationsTableName": "migrations_typeorm",
    "migrations": [
      "dist/db-migrations/*{.ts,.js}"
    ],
    "autoLoadEntities": true,
    dropSchema: true,
    synchronize: true,
    logging: true
  }),
    HttpModule,
  ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, WalletManagerService, GetBalancesService, GetTransactionsService],
})
export class AppModule { }

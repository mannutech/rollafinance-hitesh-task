import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserQueryService } from './user/query/query.service';
import { CreateService } from './user/create/create.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../db-entities/user.entity';
import { UserWallet } from '../db-entities/wallet.entity';
import { WalletManagerService } from '../services/wallet-manager/wallet-manager.service';
import { UserBalance } from '../db-entities/balances.entity';
import { GetBalancesService } from '../services/scheduled/get-balances/get-balances.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserWallet, UserBalance])
  ],
  controllers: [UserController],
  providers: [UserQueryService, CreateService, WalletManagerService, GetBalancesService],
  exports: [TypeOrmModule.forFeature([User, UserWallet, UserBalance])
  ]
})
export class HttpModule { }

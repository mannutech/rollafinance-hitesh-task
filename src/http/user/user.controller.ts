import { Controller, Post, Get, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { CreateNewUserRequest } from "./dto/CreateNewUser.dto";
import { CreateService } from './create/create.service';
import { UserQueryService } from './query/query.service';
import { BlockchainNetwork } from '../../db-entities/wallet.entity';

@Controller('user')
export class UserController {

    constructor(
        private readonly createService: CreateService,
        private readonly userQueryService: UserQueryService,
    ) {

    }

    @Post('create')
    createUser(@Body() createUserDto: CreateNewUserRequest) {
        return this.createService.handleCreateNewUser(createUserDto);
    }

    @Get(':userId')
    getUserDetails(@Param('userId') userId: number) {
        return this.userQueryService.getUserDetailsByUserId(userId);
    }

    @Get(':userId/depositAddress')
    getUserDepositAddress(
        @Param('userId') userId: number,
        @Query('networks') blockchainNetworkList?: BlockchainNetwork[]
    ) {
        return this.userQueryService.getDepositAddressByUserId(userId, blockchainNetworkList);
    }

    @Get(':userId/userName')
    getUsername(@Param('userId') userId: number) {
        return this.userQueryService.getUsernameByUserId(userId);
    }

    @Get(':userId/balance')
    getUserNativeBalance(
        @Param('userId') userId: number,
        @Query('network') blockchainNetwork?: BlockchainNetwork
    ) {
        if (!Object.values(BlockchainNetwork).includes(blockchainNetwork)) {
            throw new BadRequestException(`Network '${blockchainNetwork}' not supported.`);
        }
        return this.userQueryService.getNativeBalanceByUserIdAndNetwork(userId, blockchainNetwork);
    }

    @Get(':userId/token/balance')
    getUserTokenBalance(
        @Param('userId') userId: number,
        @Query('network') blockchainNetwork: BlockchainNetwork,
        @Query('contractAddress') contractAddress?: string,
    ) {
        if (!Object.values(BlockchainNetwork).includes(blockchainNetwork)) {
            throw new BadRequestException(`Network '${blockchainNetwork}' not supported.`);
        }
        return this.userQueryService.getTokenBalanceByUserIdNetworkAndContractAddress(userId, blockchainNetwork, contractAddress);
    }
}

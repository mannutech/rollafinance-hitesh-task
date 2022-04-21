import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../db-entities/user.entity';
import { Repository } from 'typeorm';
import { hashSync } from 'bcrypt';
import { WalletManagerService } from '../../../services/wallet-manager/wallet-manager.service';
import { BlockchainNetwork, UserWallet, BlockchainTypeCategory } from '../../../db-entities/wallet.entity';
import { CreateNewUserRequest } from '../dto/CreateNewUser.dto';

@Injectable()
export class CreateService {

    private readonly logger = new Logger(CreateService.name);

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(UserWallet)
        private walletRepo: Repository<UserWallet>,
        private readonly walletManager: WalletManagerService) {

    }

    async handleCreateNewUser(newUserDto: CreateNewUserRequest) {
        this.logger.log(`[handleCreateNewUser] Handling new user creation request.`);

        // Check for an existing username

        const findExistingUser = await this.userRepo.findOne({
            username: newUserDto.username
        });

        if (findExistingUser && findExistingUser.id) {
            throw new BadRequestException(`Username '${newUserDto.username}' already exists.`);
        }

        // Insert to the database
        const newUserRecord = new User();
        newUserRecord.username = newUserDto.username;
        newUserRecord.passwordHash = hashSync(newUserDto.password, 10);
        newUserRecord.isActive = true;

        this.logger.log(`[handleCreateNewUser] Creating new user in database. | ${JSON.stringify(newUserRecord)}`);

        const createNewUser = await this.userRepo.insert(newUserRecord);

        this.logger.log(`[handleCreateNewUser] Created a new user in database. | Results: ${JSON.stringify(createNewUser)}`);

        if (createNewUser.identifiers.length !== 1) {
            this.logger.error(`Could not insert a new user to the database.`);
            throw new InternalServerErrorException();
        }

        const userId = createNewUser.identifiers[0].id;

        // Call address generation and assigning service
        this.assignWalletToUser(userId as unknown as number);

        // Response
        return {
            status: 'ok',
            message: 'User registered successfully.',
            data: {
                userId,
                userName: createNewUser.raw[0].userName,
                createdAt: createNewUser.raw[0].createdAt
            }
        }
    }

    private async assignWalletToUser(userId: number): Promise<void> {
        
        this.logger.log(`[assignAddress] Generating and assigning new wallet to userId ${userId}}`);

        if (isNaN(userId)) {
            throw new InternalServerErrorException();
        }

        // Call address derivation service
        const derivedAddress = await this.walletManager.deriveAddressAtPath(userId);

        // create a new Wallet record
        const walletRecord = new UserWallet();
        walletRecord.userId = userId;
        walletRecord.derivationPathIndex = userId;
        walletRecord.publicAddress = derivedAddress;
        walletRecord.blockchainCategory = BlockchainTypeCategory.EVM; // By default assuming ETH compatible address
        walletRecord.isActive = true;

        // Insert generated wallet to database
        const createWalletRecord = await this.walletRepo.insert(walletRecord);

        this.logger.log(`[assignAddress] Created and assigned new wallet to userId ${userId} | Results: ${JSON.stringify(createWalletRecord)}`);
    }
}

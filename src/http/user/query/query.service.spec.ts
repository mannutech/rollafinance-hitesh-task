import { Test, TestingModule } from '@nestjs/testing';
import { UserQueryService } from './query.service';

describe('QueryService', () => {
  let service: UserQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserQueryService],
    }).compile();

    service = module.get<UserQueryService>(UserQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

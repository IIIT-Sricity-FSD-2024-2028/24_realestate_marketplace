import { Module } from '@nestjs/common';
import { BankAccountsController } from '../controllers/bank-accounts.controller.js';
import { BankAccountsService } from '../services/bank-accounts.service.js';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService]
})
export class BankAccountsModule {}

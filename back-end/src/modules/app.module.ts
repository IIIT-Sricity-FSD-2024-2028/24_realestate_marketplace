import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller.js';
import { AppService } from '../services/app.service.js';
import { UsersModule } from './users.module.js';
import { PropertiesModule } from './properties.module.js';
import { ListingsModule } from './listings.module.js';
import { BookingsModule } from './bookings.module.js';
import { AgentsModule } from './agents.module.js';
import { AdminsModule } from './admins.module.js';
import { BuyersModule } from './buyers.module.js';
import { SellersModule } from './sellers.module.js';
import { VisitsModule } from './visits.module.js';
import { ShortlistsModule } from './shortlists.module.js';
import { NegotiationsModule } from './negotiations.module.js';
import { PurchasesModule } from './purchases.module.js';
import { PaymentsModule } from './payments.module.js';
import { NotificationsModule } from './notifications.module.js';
import { ReportsModule } from './reports.module.js';
import { PropertyImagesModule } from './property-images.module.js';
import { PropertyDocumentsModule } from './property-documents.module.js';
import { BankAccountsModule } from './bank-accounts.module.js';

@Module({
  imports: [
    UsersModule,
    PropertiesModule,
    ListingsModule,
    BookingsModule,
    AgentsModule,
    AdminsModule,
    BuyersModule,
    SellersModule,
    VisitsModule,
    ShortlistsModule,
    NegotiationsModule,
    PurchasesModule,
    PaymentsModule,
    NotificationsModule,
    ReportsModule,
    PropertyImagesModule,
    PropertyDocumentsModule,
    BankAccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NegotiationsController } from './negotiations.controller.js';
import { NegotiationsService } from './negotiations.service.js';
import { Negotiation, NegotiationSchema } from './schemas/negotiation.schema.js';
import { PropertiesModule } from '../properties/properties.module.js';
import { PurchasesModule } from '../purchases/purchases.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Negotiation.name, schema: NegotiationSchema }]),
    PropertiesModule,
    PurchasesModule,
  ],
  controllers: [NegotiationsController],
  providers: [NegotiationsService],
  exports: [NegotiationsService],
})
export class NegotiationsModule {}

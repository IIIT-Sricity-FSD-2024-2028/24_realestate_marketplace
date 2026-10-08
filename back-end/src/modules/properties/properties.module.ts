import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertiesController } from './properties.controller.js';
import { PropertiesService } from './properties.service.js';
import { Property, PropertySchema } from './schemas/property.schema.js';
import { UsersModule } from '../users/users.module.js';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
    // Needed to resolve the admin who runs a property's city.
    UsersModule,
    // A seller's plan decides how many listings they may keep live, so
    // creating a listing consults the subscription first.
    SubscriptionsModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}

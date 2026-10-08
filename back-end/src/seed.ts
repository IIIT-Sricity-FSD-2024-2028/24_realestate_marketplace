/**
 * One-off database seeder.
 *
 * Creates the default admin account (matching the credentials already
 * advertised on the admin-login page) and a handful of sample properties,
 * so the app has real, database-driven data to show on first run.
 *
 * Usage: npm run build && npm run seed   (or `npm run seed:dev` for ts-node)
 */
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { UsersService } from './modules/users/users.service.js';
import { PropertiesService } from './modules/properties/properties.service.js';
import { SubscriptionsService } from './modules/subscriptions/subscriptions.service.js';
import { PaymentsService } from './modules/payments/payments.service.js';
import { PlanTier, PaymentPurpose } from './shared/enums/billing.enum.js';
import { gstOn, planPrice } from './shared/constants/pricing.js';
import { Role } from './common/enums/role.enum.js';
import { UserType, UserDocument } from './modules/users/schemas/user.schema.js';
import { PropertyType, ListingType, PropertyStatus } from './shared/enums/property.enum.js';
import { ServiceCity, SERVICE_CITIES, CITY_STATE, FALLBACK_CITY } from './shared/constants/service-cities.js';
import { Property, PropertyDocument } from './modules/properties/schemas/property.schema.js';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

const logger = new Logger('Seed');

const SAMPLE_PROPERTIES = [
  {
    title: '3BHK Spacious Apartment in Anna Nagar',
    description:
      'Beautifully furnished 3BHK with sea view, modular kitchen, and 24/7 security. Close to schools and metro station.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.SALE,
    price: 7500000,
    areaSqft: 1200,
    bedrooms: 3,
    bathrooms: 2,
    address: '42, 5th Avenue, Anna Nagar, Chennai',
    city: ServiceCity.CHENNAI,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
  },
  {
    title: 'Modern 4BHK Villa with Private Garden',
    description:
      'Independent villa with landscaped garden, covered parking for two cars, and a spacious terrace. Gated community.',
    type: PropertyType.VILLA,
    listingType: ListingType.SALE,
    price: 18500000,
    areaSqft: 2800,
    bedrooms: 4,
    bathrooms: 4,
    address: '12, Palm Meadows, Whitefield, Bangalore',
    city: ServiceCity.BANGALORE,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'],
  },
  {
    title: 'Cozy 2BHK Apartment Near IT Park',
    description:
      'Well-ventilated 2BHK ideal for young professionals, walking distance to the IT corridor and shopping malls.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.RENT,
    price: 28000,
    areaSqft: 950,
    bedrooms: 2,
    bathrooms: 2,
    address: '7th Floor, Skyline Towers, Hitech City, Hyderabad',
    city: ServiceCity.HYDERABAD,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
  },
  {
    title: 'DTCP Approved Residential Plot with Lake View',
    description:
      'Prime residential plot near the new airport corridor, excellent long-term investment opportunity.',
    type: PropertyType.PLOT,
    listingType: ListingType.SALE,
    price: 4500000,
    areaSqft: 3000,
    bedrooms: 0,
    bathrooms: 1,
    address: 'Aluva, Kochi',
    city: ServiceCity.KOCHI,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
  },
  {
    title: 'Premium Penthouse with Skyline View',
    description:
      'Duplex penthouse with private pool, home theatre, and a wraparound balcony overlooking the city skyline.',
    type: PropertyType.PENTHOUSE,
    listingType: ListingType.SALE,
    price: 32000000,
    areaSqft: 3500,
    bedrooms: 4,
    bathrooms: 5,
    address: 'Panampilly Nagar, Kochi',
    city: ServiceCity.KOCHI,
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
  },
  {
    title: 'Commercial Office Space in Business District',
    description:
      'Ready-to-move-in office space with modern interiors, ample parking, and 24/7 power backup.',
    type: PropertyType.COMMERCIAL,
    listingType: ListingType.RENT,
    price: 120000,
    areaSqft: 4200,
    bedrooms: 0,
    bathrooms: 4,
    address: 'HITEC City, Madhapur, Hyderabad',
    city: ServiceCity.HYDERABAD,
    status: PropertyStatus.AVAILABLE,
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
  },
  // ── Buyer-dashboard demo catalog ──────────────────────────────────────
  // These titles are matched exactly by "Buyer Dashboard - truEstate.html"
  // (see loadRealPropertyIds()) so its hardcoded showcase cards can submit
  // real negotiations/purchases against a real backend property.
  {
    title: 'Modern Downtown Apartment',
    description:
      'A beautifully designed 2BHK apartment in the heart of Banjara Hills. Modern interiors, spacious balconies, premium fittings. Close to schools, hospitals, and shopping centers.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.SALE,
    price: 4500000,
    areaSqft: 1200,
    bedrooms: 2,
    bathrooms: 2,
    address: 'Banjara Hills, Hyderabad',
    city: ServiceCity.HYDERABAD,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'],
  },
  {
    title: 'Luxury Villa with Garden',
    description:
      'An exclusive 4BHK luxury villa with sprawling gardens, a private pool, and high-end finishes in the prestigious Jubilee Hills locality. Perfect for discerning buyers.',
    type: PropertyType.VILLA,
    listingType: ListingType.SALE,
    price: 12500000,
    areaSqft: 2800,
    bedrooms: 4,
    bathrooms: 3,
    address: 'Boat Club Road, Chennai',
    city: ServiceCity.CHENNAI,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
  },
  {
    title: 'Spacious 3BHK Apartment',
    description:
      'A well-maintained fully furnished 3BHK in Gachibowli, ideal for IT professionals. Walking distance from major tech parks and metro stations.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.SALE,
    price: 9500000,
    areaSqft: 1800,
    bedrooms: 3,
    bathrooms: 2,
    address: 'Gachibowli, Hyderabad',
    city: ServiceCity.HYDERABAD,
    images: ['https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80'],
  },
  {
    title: 'Garden-Facing 3BHK Flat',
    description:
      'A premium 3BHK flat with garden views in Sarjapur Road by Sobha Developers. Spacious rooms, top-grade construction quality, and excellent social infrastructure nearby.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.SALE,
    price: 17800000,
    areaSqft: 1725,
    bedrooms: 3,
    bathrooms: 3,
    address: 'Sarjapur Road, Bangalore',
    city: ServiceCity.BANGALORE,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
  },
  {
    title: '4BHK Penthouse Flat',
    description:
      'Ultra-premium 4BHK penthouse with panoramic city views in HAL Old Airport Road. Fully furnished with designer interiors.',
    type: PropertyType.PENTHOUSE,
    listingType: ListingType.SALE,
    price: 95500000,
    areaSqft: 3260,
    bedrooms: 4,
    bathrooms: 4,
    address: 'HAL Old Airport Road, Bangalore',
    city: ServiceCity.BANGALORE,
    images: ['https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&q=80'],
  },
  {
    title: '2BHK Budget Apartment',
    description:
      'A comfortable 2BHK apartment in Bannerghatta Main Road. Good connectivity and peaceful neighbourhood, near hospitals and schools.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.SALE,
    price: 9200000,
    areaSqft: 1130,
    bedrooms: 2,
    bathrooms: 2,
    address: 'Velachery Main Road, Chennai',
    city: ServiceCity.CHENNAI,
    images: ['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80'],
  },
  {
    title: '2BHK Premium Flat',
    description:
      'A brand new 2BHK by Godrej Properties in rapidly developing Perungudi. Excellent connectivity to Chennai city via OMR.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.SALE,
    price: 20000000,
    areaSqft: 1386,
    bedrooms: 2,
    bathrooms: 2,
    address: 'Perungudi, OMR, Chennai',
    city: ServiceCity.CHENNAI,
    images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80'],
  },
  {
    title: 'Sea-View 4BHK Apartment',
    description:
      'Ultra-luxury apartment on the 28th floor of one of Necklace Road finest towers. Panoramic Hussain Sagar lake views, fully furnished, world-class amenities.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.SALE,
    price: 85000000,
    areaSqft: 4000,
    bedrooms: 4,
    bathrooms: 4,
    address: 'Necklace Road, Hyderabad',
    city: ServiceCity.HYDERABAD,
    images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'],
  },
  {
    title: 'Heritage Bungalow',
    description:
      'A rare heritage bungalow in the leafy streets of Adyar. Expansive grounds, old-world charm, and proximity to beaches make this a truly unique investment.',
    type: PropertyType.VILLA,
    listingType: ListingType.SALE,
    price: 45000000,
    areaSqft: 6000,
    bedrooms: 4,
    bathrooms: 4,
    address: 'Adyar, Chennai',
    city: ServiceCity.CHENNAI,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
  },
  {
    title: 'Budget 1BHK Studio',
    description:
      'An affordable 1BHK studio apartment ideal for young professionals working in Electronic City. Well-connected with public transport.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.RENT,
    price: 32000,
    areaSqft: 1200,
    bedrooms: 1,
    bathrooms: 1,
    address: 'Electronic City, Bangalore',
    city: ServiceCity.BANGALORE,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
  },
  {
    title: '3BHK Gated Community',
    description:
      'A fully furnished 3BHK in a premium gated community in Bellandur. Modern amenities, great connectivity, and vibrant social scene.',
    type: PropertyType.APARTMENT,
    listingType: ListingType.RENT,
    price: 72000,
    areaSqft: 1800,
    bedrooms: 3,
    bathrooms: 2,
    address: 'Kondapur, Hyderabad',
    city: ServiceCity.HYDERABAD,
    images: ['https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80'],
  },
  {
    title: 'Plot with Lake View',
    description:
      'A prime DTCP approved plot with stunning lake view near the new airport. Excellent investment opportunity in the fastest growing corridor.',
    type: PropertyType.PLOT,
    listingType: ListingType.SALE,
    price: 4500000,
    areaSqft: 3000,
    bedrooms: 0,
    bathrooms: 1,
    address: 'Shamshabad, Hyderabad',
    city: ServiceCity.HYDERABAD,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
  },
  {
    title: 'Spacious Family Home',
    description:
      'A spacious and well-lit family home located in the peaceful yet connected neighborhood of Gachibowli. Features a large garden and modern amenities.',
    type: PropertyType.VILLA,
    listingType: ListingType.SALE,
    price: 7800000,
    areaSqft: 2200,
    bedrooms: 4,
    bathrooms: 3,
    address: 'Bellandur, Bangalore',
    city: ServiceCity.BANGALORE,
    images: ['https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80'],
  },
];

// The sample catalogue is listed by this seller, not by the admin: only a
// seller account can create a property now (see PropertiesService.create), and
// a listing with no seller would be one nobody could accept an offer on.
const SELLER_SEED = { name: 'Demo Seller', email: 'seller@gmail.com', password: '123456789' };

// One admin per launch city, and no all-cities admin account. Every listing
// belongs to a city, and that city's admin is the only one who verifies it,
// handles its site visits, watches its negotiations and drives its purchase
// steps (see PropertiesService.assertRunsCity). The superuser is the only
// account that sees across cities. Admin credentials come from
// `cityAdmins` in configuration.ts.

async function seed() {
  // 'log' must stay enabled here — Nest's Logger has shared static state, so
  // restricting it to ['error','warn'] silently swallowed every logger.log()
  // call below too (seeding ran fine but printed nothing, making failures and
  // successes indistinguishable from the CLI).
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);
  const propertiesService = app.get(PropertiesService);
  const subscriptionsService = app.get(SubscriptionsService);
  const paymentsService = app.get(PaymentsService);

  const cityAdmins = configService.get('cityAdmins') as {
    city: ServiceCity;
    name: string;
    email: string;
    state: string;
    password: string;
  }[];
  const superuserSeed = configService.get('superuserSeed') as {
    name: string;
    email: string;
    password: string;
  };

  // ── One admin per launch city ───────────────────────────────────────────
  // `city` on the admin account is what every queue filters on, so it is set
  // here and kept in sync on re-runs — an admin whose city is missing or
  // stale would see an empty desk.
  const adminsByCity = new Map<ServiceCity, UserDocument>();
  for (const seedAdmin of cityAdmins) {
    let existing = await usersService.findAccountForAuth(seedAdmin.email, null);
    if (!existing) {
      await usersService.create({
        name: seedAdmin.name,
        email: seedAdmin.email,
        password: seedAdmin.password,
        role: Role.ADMIN,
        city: seedAdmin.city,
        state: seedAdmin.state,
      });
      existing = await usersService.findAccountForAuth(seedAdmin.email, null);
      logger.log(`Created ${seedAdmin.city} admin: ${seedAdmin.email}`);
    } else {
      if (existing.city !== seedAdmin.city || existing.role !== Role.ADMIN) {
        existing.city = seedAdmin.city;
        existing.state = seedAdmin.state;
        existing.role = Role.ADMIN;
        await existing.save();
        logger.log(`Re-pointed ${seedAdmin.email} at the ${seedAdmin.city} desk`);
      } else {
        logger.log(`${seedAdmin.city} admin already exists: ${seedAdmin.email}`);
      }
    }
    if (existing) adminsByCity.set(seedAdmin.city, existing);
  }

  // Admin accounts from earlier designs, removed by exact email so nothing a
  // superuser has since created is touched:
  //  - admin@gmail.com was the single all-cities admin. With four city desks
  //    there is no such thing as an admin who handles everything, and leaving
  //    it alive would leave an admin whose city is null and whose queues are
  //    therefore permanently empty.
  //  - admin.<city>@gmail.com are leftovers from a previous location-admin
  //    attempt that was torn out. Each one shares a city with a real desk, and
  //    "one admin per city" has to actually hold: two accounts answering the
  //    same queue is the ambiguity this whole model exists to remove.
  const RETIRED_ADMIN_EMAILS = [
    'admin@gmail.com',
    'admin.hyderabad@gmail.com',
    'admin.chennai@gmail.com',
    'admin.bangalore@gmail.com',
    'admin.kochi@gmail.com',
  ];
  for (const email of RETIRED_ADMIN_EMAILS) {
    const retired = await usersService.findAccountForAuth(email, null);
    if (retired && retired.role === Role.ADMIN) {
      await retired.deleteOne();
      logger.log(`Removed retired admin account: ${email}`);
    }
  }

  // ── Superuser account ────────────────────────────────────────────────────
  try {
    const superuser = await usersService.create({
      name: superuserSeed.name,
      email: superuserSeed.email,
      password: superuserSeed.password,
      role: Role.SUPERUSER,
    });
    logger.log(`Created superuser: ${superuser.email}`);
  } catch {
    logger.log(`Superuser already exists: ${superuserSeed.email}`);
  }

  // ── Demo seller account ──────────────────────────────────────────────────
  let seller;
  try {
    seller = await usersService.create({
      name: SELLER_SEED.name,
      email: SELLER_SEED.email,
      password: SELLER_SEED.password,
      role: Role.USER,
      userType: UserType.SELLER,
    });
    logger.log(`Created seller user: ${seller.email}`);
  } catch {
    seller = await usersService
      .findAll()
      .then((users) => users.find((u) => u.email === SELLER_SEED.email.toLowerCase() && u.userType === UserType.SELLER));
    logger.log(`Seller user already exists: ${SELLER_SEED.email}`);
  }

  // ── Re-file the sample catalogue onto the four launch cities ────────────
  // The samples predate the four-city model and were spread over Mumbai,
  // Gurugram, Bengaluru and friends; SAMPLE_PROPERTIES now spreads them
  // evenly over the four cities instead, with an address to match. Matching
  // on title (the same key the create-if-missing loop below uses, and the
  // key the buyer dashboard matches on) re-files listings that were seeded
  // before this change, so an existing database converges to the same
  // layout a fresh one gets rather than keeping its old cities forever.
  //
  // `address` and `description` are part of the match, not just the update:
  // matching on city/admin alone left listings whose city had already been
  // corrected still showing their pre-launch street ("Worli, Mumbai" on a
  // listing filed under Kochi), because the update that would have fixed the
  // address never matched once the city agreed.
  const propertyModel = app.get<Model<PropertyDocument>>(getModelToken(Property.name));
  let refiled = 0;
  for (const sample of SAMPLE_PROPERTIES) {
    const admin = adminsByCity.get(sample.city);
    const result = await propertyModel.updateOne(
      {
        title: sample.title,
        $or: [
          { city: { $ne: sample.city } },
          { adminId: { $ne: admin?._id ?? null } },
          { address: { $ne: sample.address } },
          { description: { $ne: sample.description } },
        ],
      },
      {
        $set: {
          city: sample.city,
          state: CITY_STATE[sample.city],
          address: sample.address,
          description: sample.description,
          adminId: admin?._id ?? null,
        },
      },
    );
    refiled += result.modifiedCount;
  }
  if (refiled) logger.log(`Re-filed ${refiled} sample listings onto their launch city.`);

  // ── Everything else, including listings in cities we no longer serve ────
  // Everything that predates the four-city launch (Mumbai, Gurugram, and any
  // other city a seller could type back when `city` was a free-text field)
  // goes to the FALLBACK_CITY desk, so no listing is left with no admin to
  // handle it. Recognised legacy spellings ("Bengaluru") are canonicalised on
  // boot instead — see PropertiesService.syncCityAdmins.
  //
  // A single fixed desk, not the round-robin this used to do: spreading them
  // by current listing count made the destination depend on the order rows
  // happened to be inserted in, so the same listing landed on a different
  // desk on a different database, and nobody could answer "who handles the
  // Mumbai ones?" without querying. FALLBACK_CITY is the answer, always.
  const orphaned = await propertyModel.find({ city: { $nin: SERVICE_CITIES } }, '_id city');
  if (orphaned.length) {
    const fallbackAdmin = adminsByCity.get(FALLBACK_CITY);
    for (const property of orphaned) {
      await propertyModel.updateOne(
        { _id: property._id },
        {
          $set: {
            city: FALLBACK_CITY,
            state: CITY_STATE[FALLBACK_CITY],
            adminId: fallbackAdmin?._id ?? null,
          },
        },
      );
      logger.log(
        `Moved "${property.city}" listing ${property._id.toString()} to ${FALLBACK_CITY} (${fallbackAdmin?.email ?? 'no admin seeded'})`,
      );
    }
  }

  // ── Demo seller's listing plan ──────────────────────────────────────────
  // The free Starter tier allows 2 active listings, and the sample catalogue
  // below is far larger than that — so without a plan the seeder would hit
  // its own 402 quota wall partway through. Putting the demo seller on Gold
  // (unlimited) both fixes that and leaves the superuser Revenue page with
  // something real to show on a freshly seeded database.
  //
  // The payment is written through the ordinary ledger path and captured the
  // way a gateway webhook would, so it is a normal row rather than a special
  // case the revenue report has to know about.
  if (seller) {
    const existingPlan = await subscriptionsService.activePlan(seller.id);
    if (existingPlan.tier === PlanTier.FREE) {
      const base = planPrice(PlanTier.GOLD, 'yearly');
      const { payment, checkout } = await paymentsService.openOrder({
        userId: seller.id,
        purpose: PaymentPurpose.SUBSCRIPTION,
        baseAmount: base,
        taxAmount: gstOn(base),
        description: 'Gold plan — yearly',
        metadata: { tier: PlanTier.GOLD, cycle: 'yearly', seeded: true },
      });
      await paymentsService.captureFromWebhook(checkout.orderId, 'pay_seed');
      await subscriptionsService.activate(
        seller.id,
        PlanTier.GOLD,
        'yearly',
        payment.amount,
        payment._id.toString(),
      );
      logger.log(`Put ${seller.email} on the Gold plan (unlimited listings) — ₹${payment.amount} recorded.`);
    } else {
      logger.log(`${seller.email} already holds the ${existingPlan.definition.name} plan.`);
    }
  }

  // ── Sample properties ───────────────────────────────────────────────────
  // Checked per-title (not just "any properties exist") so re-running after
  // SAMPLE_PROPERTIES grows still backfills the newly added ones.
  //
  // Seeded as the demo *seller* (properties belong to sellers now), then
  // verified by that city's admin — a seller submission starts PENDING and
  // would otherwise be invisible in public search, leaving a freshly seeded
  // app looking empty. Verification has to come from the *right* admin now:
  // PropertiesService.verify rejects an admin acting outside their own city.
  if (seller) {
    // `includeClosed` — a sample listing that has since been sold is hidden
    // from the default search, and without it the seeder would decide the
    // title is missing and create a second copy on every run.
    const existing = await propertiesService.search({ page: 1, limit: 100 }, true);
    const existingTitles = new Set(existing.items.map((p) => p.title));
    const sellerActor = {
      id: seller.id,
      email: seller.email,
      name: seller.name,
      role: Role.USER,
      userType: UserType.SELLER,
      city: null,
    };
    let created = 0;
    for (const sample of SAMPLE_PROPERTIES) {
      if (existingTitles.has(sample.title)) continue;
      const cityAdmin = adminsByCity.get(sample.city);
      if (!cityAdmin) {
        logger.warn(`Skipping "${sample.title}" — no admin seeded for ${sample.city}`);
        continue;
      }
      const property = await propertiesService.create(sample, sellerActor);
      await propertiesService.verify(property.id, {
        id: cityAdmin._id.toString(),
        email: cityAdmin.email,
        name: cityAdmin.name,
        role: Role.ADMIN,
        userType: null,
        city: cityAdmin.city,
      });
      created++;
    }
    logger.log(`Seeded ${created} new sample properties as ${seller.email} (${SAMPLE_PROPERTIES.length - created} already existed).`);
  }

  logger.log('Seeding complete.');
  for (const seedAdmin of cityAdmins) {
    logger.log(`${seedAdmin.city} admin login → email: ${seedAdmin.email}  password: ${seedAdmin.password}`);
  }
  logger.log(`Superuser login → email: ${superuserSeed.email}  password: ${superuserSeed.password}`);
  logger.log(`Seller login → email: ${SELLER_SEED.email}  password: ${SELLER_SEED.password}`);


  await app.close();
  process.exit(0);
}

seed().catch((error) => {
  logger.error('Seeding failed', error);
  process.exit(1);
});

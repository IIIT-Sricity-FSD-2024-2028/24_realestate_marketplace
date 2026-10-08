"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const app_module_js_1 = require("./app.module.js");
const users_service_js_1 = require("./modules/users/users.service.js");
const properties_service_js_1 = require("./modules/properties/properties.service.js");
const subscriptions_service_js_1 = require("./modules/subscriptions/subscriptions.service.js");
const payments_service_js_1 = require("./modules/payments/payments.service.js");
const billing_enum_js_1 = require("./shared/enums/billing.enum.js");
const pricing_js_1 = require("./shared/constants/pricing.js");
const role_enum_js_1 = require("./common/enums/role.enum.js");
const user_schema_js_1 = require("./modules/users/schemas/user.schema.js");
const property_enum_js_1 = require("./shared/enums/property.enum.js");
const service_cities_js_1 = require("./shared/constants/service-cities.js");
const property_schema_js_1 = require("./modules/properties/schemas/property.schema.js");
const mongoose_1 = require("@nestjs/mongoose");
const logger = new common_1.Logger('Seed');
const SAMPLE_PROPERTIES = [
    {
        title: '3BHK Spacious Apartment in Anna Nagar',
        description: 'Beautifully furnished 3BHK with sea view, modular kitchen, and 24/7 security. Close to schools and metro station.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 7500000,
        areaSqft: 1200,
        bedrooms: 3,
        bathrooms: 2,
        address: '42, 5th Avenue, Anna Nagar, Chennai',
        city: service_cities_js_1.ServiceCity.CHENNAI,
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
    },
    {
        title: 'Modern 4BHK Villa with Private Garden',
        description: 'Independent villa with landscaped garden, covered parking for two cars, and a spacious terrace. Gated community.',
        type: property_enum_js_1.PropertyType.VILLA,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 18500000,
        areaSqft: 2800,
        bedrooms: 4,
        bathrooms: 4,
        address: '12, Palm Meadows, Whitefield, Bangalore',
        city: service_cities_js_1.ServiceCity.BANGALORE,
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'],
    },
    {
        title: 'Cozy 2BHK Apartment Near IT Park',
        description: 'Well-ventilated 2BHK ideal for young professionals, walking distance to the IT corridor and shopping malls.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.RENT,
        price: 28000,
        areaSqft: 950,
        bedrooms: 2,
        bathrooms: 2,
        address: '7th Floor, Skyline Towers, Hitech City, Hyderabad',
        city: service_cities_js_1.ServiceCity.HYDERABAD,
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
    },
    {
        title: 'DTCP Approved Residential Plot with Lake View',
        description: 'Prime residential plot near the new airport corridor, excellent long-term investment opportunity.',
        type: property_enum_js_1.PropertyType.PLOT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 4500000,
        areaSqft: 3000,
        bedrooms: 0,
        bathrooms: 1,
        address: 'Aluva, Kochi',
        city: service_cities_js_1.ServiceCity.KOCHI,
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
    },
    {
        title: 'Premium Penthouse with Skyline View',
        description: 'Duplex penthouse with private pool, home theatre, and a wraparound balcony overlooking the city skyline.',
        type: property_enum_js_1.PropertyType.PENTHOUSE,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 32000000,
        areaSqft: 3500,
        bedrooms: 4,
        bathrooms: 5,
        address: 'Panampilly Nagar, Kochi',
        city: service_cities_js_1.ServiceCity.KOCHI,
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
    },
    {
        title: 'Commercial Office Space in Business District',
        description: 'Ready-to-move-in office space with modern interiors, ample parking, and 24/7 power backup.',
        type: property_enum_js_1.PropertyType.COMMERCIAL,
        listingType: property_enum_js_1.ListingType.RENT,
        price: 120000,
        areaSqft: 4200,
        bedrooms: 0,
        bathrooms: 4,
        address: 'HITEC City, Madhapur, Hyderabad',
        city: service_cities_js_1.ServiceCity.HYDERABAD,
        status: property_enum_js_1.PropertyStatus.AVAILABLE,
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    },
    {
        title: 'Modern Downtown Apartment',
        description: 'A beautifully designed 2BHK apartment in the heart of Banjara Hills. Modern interiors, spacious balconies, premium fittings. Close to schools, hospitals, and shopping centers.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 4500000,
        areaSqft: 1200,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Banjara Hills, Hyderabad',
        city: service_cities_js_1.ServiceCity.HYDERABAD,
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'],
    },
    {
        title: 'Luxury Villa with Garden',
        description: 'An exclusive 4BHK luxury villa with sprawling gardens, a private pool, and high-end finishes in the prestigious Jubilee Hills locality. Perfect for discerning buyers.',
        type: property_enum_js_1.PropertyType.VILLA,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 12500000,
        areaSqft: 2800,
        bedrooms: 4,
        bathrooms: 3,
        address: 'Boat Club Road, Chennai',
        city: service_cities_js_1.ServiceCity.CHENNAI,
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
    },
    {
        title: 'Spacious 3BHK Apartment',
        description: 'A well-maintained fully furnished 3BHK in Gachibowli, ideal for IT professionals. Walking distance from major tech parks and metro stations.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 9500000,
        areaSqft: 1800,
        bedrooms: 3,
        bathrooms: 2,
        address: 'Gachibowli, Hyderabad',
        city: service_cities_js_1.ServiceCity.HYDERABAD,
        images: ['https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80'],
    },
    {
        title: 'Garden-Facing 3BHK Flat',
        description: 'A premium 3BHK flat with garden views in Sarjapur Road by Sobha Developers. Spacious rooms, top-grade construction quality, and excellent social infrastructure nearby.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 17800000,
        areaSqft: 1725,
        bedrooms: 3,
        bathrooms: 3,
        address: 'Sarjapur Road, Bangalore',
        city: service_cities_js_1.ServiceCity.BANGALORE,
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
    },
    {
        title: '4BHK Penthouse Flat',
        description: 'Ultra-premium 4BHK penthouse with panoramic city views in HAL Old Airport Road. Fully furnished with designer interiors.',
        type: property_enum_js_1.PropertyType.PENTHOUSE,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 95500000,
        areaSqft: 3260,
        bedrooms: 4,
        bathrooms: 4,
        address: 'HAL Old Airport Road, Bangalore',
        city: service_cities_js_1.ServiceCity.BANGALORE,
        images: ['https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&q=80'],
    },
    {
        title: '2BHK Budget Apartment',
        description: 'A comfortable 2BHK apartment in Bannerghatta Main Road. Good connectivity and peaceful neighbourhood, near hospitals and schools.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 9200000,
        areaSqft: 1130,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Velachery Main Road, Chennai',
        city: service_cities_js_1.ServiceCity.CHENNAI,
        images: ['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80'],
    },
    {
        title: '2BHK Premium Flat',
        description: 'A brand new 2BHK by Godrej Properties in rapidly developing Perungudi. Excellent connectivity to Chennai city via OMR.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 20000000,
        areaSqft: 1386,
        bedrooms: 2,
        bathrooms: 2,
        address: 'Perungudi, OMR, Chennai',
        city: service_cities_js_1.ServiceCity.CHENNAI,
        images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80'],
    },
    {
        title: 'Sea-View 4BHK Apartment',
        description: 'Ultra-luxury apartment on the 28th floor of one of Necklace Road finest towers. Panoramic Hussain Sagar lake views, fully furnished, world-class amenities.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 85000000,
        areaSqft: 4000,
        bedrooms: 4,
        bathrooms: 4,
        address: 'Necklace Road, Hyderabad',
        city: service_cities_js_1.ServiceCity.HYDERABAD,
        images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'],
    },
    {
        title: 'Heritage Bungalow',
        description: 'A rare heritage bungalow in the leafy streets of Adyar. Expansive grounds, old-world charm, and proximity to beaches make this a truly unique investment.',
        type: property_enum_js_1.PropertyType.VILLA,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 45000000,
        areaSqft: 6000,
        bedrooms: 4,
        bathrooms: 4,
        address: 'Adyar, Chennai',
        city: service_cities_js_1.ServiceCity.CHENNAI,
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
    },
    {
        title: 'Budget 1BHK Studio',
        description: 'An affordable 1BHK studio apartment ideal for young professionals working in Electronic City. Well-connected with public transport.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.RENT,
        price: 32000,
        areaSqft: 1200,
        bedrooms: 1,
        bathrooms: 1,
        address: 'Electronic City, Bangalore',
        city: service_cities_js_1.ServiceCity.BANGALORE,
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
    },
    {
        title: '3BHK Gated Community',
        description: 'A fully furnished 3BHK in a premium gated community in Bellandur. Modern amenities, great connectivity, and vibrant social scene.',
        type: property_enum_js_1.PropertyType.APARTMENT,
        listingType: property_enum_js_1.ListingType.RENT,
        price: 72000,
        areaSqft: 1800,
        bedrooms: 3,
        bathrooms: 2,
        address: 'Kondapur, Hyderabad',
        city: service_cities_js_1.ServiceCity.HYDERABAD,
        images: ['https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80'],
    },
    {
        title: 'Plot with Lake View',
        description: 'A prime DTCP approved plot with stunning lake view near the new airport. Excellent investment opportunity in the fastest growing corridor.',
        type: property_enum_js_1.PropertyType.PLOT,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 4500000,
        areaSqft: 3000,
        bedrooms: 0,
        bathrooms: 1,
        address: 'Shamshabad, Hyderabad',
        city: service_cities_js_1.ServiceCity.HYDERABAD,
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
    },
    {
        title: 'Spacious Family Home',
        description: 'A spacious and well-lit family home located in the peaceful yet connected neighborhood of Gachibowli. Features a large garden and modern amenities.',
        type: property_enum_js_1.PropertyType.VILLA,
        listingType: property_enum_js_1.ListingType.SALE,
        price: 7800000,
        areaSqft: 2200,
        bedrooms: 4,
        bathrooms: 3,
        address: 'Bellandur, Bangalore',
        city: service_cities_js_1.ServiceCity.BANGALORE,
        images: ['https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80'],
    },
];
const SELLER_SEED = { name: 'Demo Seller', email: 'seller@gmail.com', password: '123456789' };
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_js_1.AppModule, { logger: ['error', 'warn', 'log'] });
    const configService = app.get(config_1.ConfigService);
    const usersService = app.get(users_service_js_1.UsersService);
    const propertiesService = app.get(properties_service_js_1.PropertiesService);
    const subscriptionsService = app.get(subscriptions_service_js_1.SubscriptionsService);
    const paymentsService = app.get(payments_service_js_1.PaymentsService);
    const cityAdmins = configService.get('cityAdmins');
    const superuserSeed = configService.get('superuserSeed');
    const adminsByCity = new Map();
    for (const seedAdmin of cityAdmins) {
        let existing = await usersService.findAccountForAuth(seedAdmin.email, null);
        if (!existing) {
            await usersService.create({
                name: seedAdmin.name,
                email: seedAdmin.email,
                password: seedAdmin.password,
                role: role_enum_js_1.Role.ADMIN,
                city: seedAdmin.city,
                state: seedAdmin.state,
            });
            existing = await usersService.findAccountForAuth(seedAdmin.email, null);
            logger.log(`Created ${seedAdmin.city} admin: ${seedAdmin.email}`);
        }
        else {
            if (existing.city !== seedAdmin.city || existing.role !== role_enum_js_1.Role.ADMIN) {
                existing.city = seedAdmin.city;
                existing.state = seedAdmin.state;
                existing.role = role_enum_js_1.Role.ADMIN;
                await existing.save();
                logger.log(`Re-pointed ${seedAdmin.email} at the ${seedAdmin.city} desk`);
            }
            else {
                logger.log(`${seedAdmin.city} admin already exists: ${seedAdmin.email}`);
            }
        }
        if (existing)
            adminsByCity.set(seedAdmin.city, existing);
    }
    const RETIRED_ADMIN_EMAILS = [
        'admin@gmail.com',
        'admin.hyderabad@gmail.com',
        'admin.chennai@gmail.com',
        'admin.bangalore@gmail.com',
        'admin.kochi@gmail.com',
    ];
    for (const email of RETIRED_ADMIN_EMAILS) {
        const retired = await usersService.findAccountForAuth(email, null);
        if (retired && retired.role === role_enum_js_1.Role.ADMIN) {
            await retired.deleteOne();
            logger.log(`Removed retired admin account: ${email}`);
        }
    }
    try {
        const superuser = await usersService.create({
            name: superuserSeed.name,
            email: superuserSeed.email,
            password: superuserSeed.password,
            role: role_enum_js_1.Role.SUPERUSER,
        });
        logger.log(`Created superuser: ${superuser.email}`);
    }
    catch {
        logger.log(`Superuser already exists: ${superuserSeed.email}`);
    }
    let seller;
    try {
        seller = await usersService.create({
            name: SELLER_SEED.name,
            email: SELLER_SEED.email,
            password: SELLER_SEED.password,
            role: role_enum_js_1.Role.USER,
            userType: user_schema_js_1.UserType.SELLER,
        });
        logger.log(`Created seller user: ${seller.email}`);
    }
    catch {
        seller = await usersService
            .findAll()
            .then((users) => users.find((u) => u.email === SELLER_SEED.email.toLowerCase() && u.userType === user_schema_js_1.UserType.SELLER));
        logger.log(`Seller user already exists: ${SELLER_SEED.email}`);
    }
    const propertyModel = app.get((0, mongoose_1.getModelToken)(property_schema_js_1.Property.name));
    let refiled = 0;
    for (const sample of SAMPLE_PROPERTIES) {
        const admin = adminsByCity.get(sample.city);
        const result = await propertyModel.updateOne({
            title: sample.title,
            $or: [
                { city: { $ne: sample.city } },
                { adminId: { $ne: admin?._id ?? null } },
                { address: { $ne: sample.address } },
                { description: { $ne: sample.description } },
            ],
        }, {
            $set: {
                city: sample.city,
                state: service_cities_js_1.CITY_STATE[sample.city],
                address: sample.address,
                description: sample.description,
                adminId: admin?._id ?? null,
            },
        });
        refiled += result.modifiedCount;
    }
    if (refiled)
        logger.log(`Re-filed ${refiled} sample listings onto their launch city.`);
    const orphaned = await propertyModel.find({ city: { $nin: service_cities_js_1.SERVICE_CITIES } }, '_id city');
    if (orphaned.length) {
        const fallbackAdmin = adminsByCity.get(service_cities_js_1.FALLBACK_CITY);
        for (const property of orphaned) {
            await propertyModel.updateOne({ _id: property._id }, {
                $set: {
                    city: service_cities_js_1.FALLBACK_CITY,
                    state: service_cities_js_1.CITY_STATE[service_cities_js_1.FALLBACK_CITY],
                    adminId: fallbackAdmin?._id ?? null,
                },
            });
            logger.log(`Moved "${property.city}" listing ${property._id.toString()} to ${service_cities_js_1.FALLBACK_CITY} (${fallbackAdmin?.email ?? 'no admin seeded'})`);
        }
    }
    if (seller) {
        const existingPlan = await subscriptionsService.activePlan(seller.id);
        if (existingPlan.tier === billing_enum_js_1.PlanTier.FREE) {
            const base = (0, pricing_js_1.planPrice)(billing_enum_js_1.PlanTier.GOLD, 'yearly');
            const { payment, checkout } = await paymentsService.openOrder({
                userId: seller.id,
                purpose: billing_enum_js_1.PaymentPurpose.SUBSCRIPTION,
                baseAmount: base,
                taxAmount: (0, pricing_js_1.gstOn)(base),
                description: 'Gold plan — yearly',
                metadata: { tier: billing_enum_js_1.PlanTier.GOLD, cycle: 'yearly', seeded: true },
            });
            await paymentsService.captureFromWebhook(checkout.orderId, 'pay_seed');
            await subscriptionsService.activate(seller.id, billing_enum_js_1.PlanTier.GOLD, 'yearly', payment.amount, payment._id.toString());
            logger.log(`Put ${seller.email} on the Gold plan (unlimited listings) — ₹${payment.amount} recorded.`);
        }
        else {
            logger.log(`${seller.email} already holds the ${existingPlan.definition.name} plan.`);
        }
    }
    if (seller) {
        const existing = await propertiesService.search({ page: 1, limit: 100 }, true);
        const existingTitles = new Set(existing.items.map((p) => p.title));
        const sellerActor = {
            id: seller.id,
            email: seller.email,
            name: seller.name,
            role: role_enum_js_1.Role.USER,
            userType: user_schema_js_1.UserType.SELLER,
            city: null,
        };
        let created = 0;
        for (const sample of SAMPLE_PROPERTIES) {
            if (existingTitles.has(sample.title))
                continue;
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
                role: role_enum_js_1.Role.ADMIN,
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
//# sourceMappingURL=seed.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_cities_js_1 = require("../shared/constants/service-cities.js");
exports.default = () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    host: process.env.HOST ?? '0.0.0.0',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    corsOrigins: process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000',
    mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/real_estate',
    jwt: {
        secret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    },
    cityAdmins: [
        { city: service_cities_js_1.ServiceCity.HYDERABAD, name: 'Hyderabad Admin', email: 'adminhyd@gmail.com' },
        { city: service_cities_js_1.ServiceCity.CHENNAI, name: 'Chennai Admin', email: 'adminchn@gmail.com' },
        { city: service_cities_js_1.ServiceCity.BANGALORE, name: 'Bangalore Admin', email: 'adminb@gmail.com' },
        { city: service_cities_js_1.ServiceCity.KOCHI, name: 'Kochi Admin', email: 'adminkoc@gmail.com' },
    ].map((admin) => ({
        ...admin,
        state: service_cities_js_1.CITY_STATE[admin.city],
        password: process.env.ADMIN_SEED_PASSWORD ?? '123456789',
    })),
    superuserSeed: {
        name: process.env.SUPERUSER_SEED_NAME ?? 'Super Admin',
        email: process.env.SUPERUSER_SEED_EMAIL ?? 'superuser@gmail.com',
        password: process.env.SUPERUSER_SEED_PASSWORD ?? '123456789',
    },
    appUrl: process.env.APP_URL ?? `http://localhost:${process.env.PORT ?? '3000'}`,
    payments: {
        razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID || null,
            keySecret: process.env.RAZORPAY_KEY_SECRET || null,
            webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || null,
        },
    },
    mail: {
        host: process.env.SMTP_HOST ?? null,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER ?? null,
        pass: process.env.SMTP_PASS ?? null,
        from: process.env.MAIL_FROM ?? 'truEstate <no-reply@truestate.local>',
    },
});
//# sourceMappingURL=configuration.js.map
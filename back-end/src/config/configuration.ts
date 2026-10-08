import { ServiceCity, CITY_STATE } from '../shared/constants/service-cities.js';

/**
 * Application configuration factory.
 *
 * Returns an object containing all application-level settings, read from
 * environment variables (populated from `.env` via @nestjs/config).
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  // 0.0.0.0 (not 127.0.0.1) so the server accepts connections from outside the
  // container/VM — required by every PaaS (Render, Railway, Fly, Docker, etc.),
  // whose reverse proxy connects from a different network namespace than
  // loopback. Harmless for local dev too (0.0.0.0 still answers localhost).
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigins: process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000',

  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/real_estate',

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-only-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },

  // One admin desk per launch city (see ServiceCity in
  // shared/constants/service-cities.ts). There is no all-cities admin
  // account: every admin belongs to exactly one city and only ever sees that
  // city's listings, visits, negotiations and purchases. The superuser is the
  // only account with a platform-wide view.
  cityAdmins: [
    { city: ServiceCity.HYDERABAD, name: 'Hyderabad Admin', email: 'adminhyd@gmail.com' },
    { city: ServiceCity.CHENNAI, name: 'Chennai Admin', email: 'adminchn@gmail.com' },
    { city: ServiceCity.BANGALORE, name: 'Bangalore Admin', email: 'adminb@gmail.com' },
    { city: ServiceCity.KOCHI, name: 'Kochi Admin', email: 'adminkoc@gmail.com' },
  ].map((admin) => ({
    ...admin,
    state: CITY_STATE[admin.city],
    password: process.env.ADMIN_SEED_PASSWORD ?? '123456789',
  })),

  superuserSeed: {
    name: process.env.SUPERUSER_SEED_NAME ?? 'Super Admin',
    email: process.env.SUPERUSER_SEED_EMAIL ?? 'superuser@gmail.com',
    password: process.env.SUPERUSER_SEED_PASSWORD ?? '123456789',
  },

  // Public base URL of this deployment. No email currently embeds a link
  // (forgot-password mails a password, not a reset link), so nothing reads
  // this today — kept as the one place to define the public origin for any
  // future emailed link. Defaults to the local dev server's own address.
  appUrl: process.env.APP_URL ?? `http://localhost:${process.env.PORT ?? '3000'}`,

  /**
   * Payment gateway credentials.
   *
   * Leave these blank and the app runs on the built-in offline gateway, which
   * implements Razorpay's order + HMAC-signature protocol locally — every
   * checkout, verification and receipt works with no account and no real
   * money. Fill both in and RazorpayGateway takes over automatically; no code
   * changes anywhere. Test keys (`rzp_test_...`) still move no real money.
   */
  payments: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || null,
      keySecret: process.env.RAZORPAY_KEY_SECRET || null,
      // Separate from the key secret: webhooks are signed with this one.
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || null,
    },
  },

  // SMTP credentials for outbound transactional email (currently: the
  // forgot-password email carrying a newly generated password). If SMTP_HOST/SMTP_USER/SMTP_PASS are unset, MailService falls
  // back to logging the email content server-side instead of sending it —
  // fine for local dev, but real credentials are required for the reset
  // link to actually reach a user's inbox.
  mail: {
    host: process.env.SMTP_HOST ?? null,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? null,
    pass: process.env.SMTP_PASS ?? null,
    from: process.env.MAIL_FROM ?? 'truEstate <no-reply@truestate.local>',
  },
});

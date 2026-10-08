import { ServiceCity } from '../shared/constants/service-cities.js';
declare const _default: () => {
    port: number;
    host: string;
    nodeEnv: string;
    corsOrigins: string;
    mongodbUri: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cityAdmins: {
        state: string;
        password: string;
        city: ServiceCity;
        name: string;
        email: string;
    }[];
    superuserSeed: {
        name: string;
        email: string;
        password: string;
    };
    appUrl: string;
    payments: {
        razorpay: {
            keyId: string | null;
            keySecret: string | null;
            webhookSecret: string | null;
        };
    };
    mail: {
        host: string | null;
        port: number;
        secure: boolean;
        user: string | null;
        pass: string | null;
        from: string;
    };
};
export default _default;

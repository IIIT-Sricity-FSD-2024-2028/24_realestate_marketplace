export declare const successResponse: (data: any, message?: string) => {
    success: boolean;
    data: any;
    message: string;
};
export declare const errorResponse: (message?: string) => {
    success: boolean;
    data: null;
    message: string;
};

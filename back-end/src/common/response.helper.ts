export const successResponse = (data: any, message = 'Success') => ({
    success: true,
    data,
    message,
  });
  
  export const errorResponse = (message = 'Something went wrong') => ({
    success: false,
    data: null,
    message,
  });
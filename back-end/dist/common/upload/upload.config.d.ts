import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
export declare const MAX_FILE_SIZE_BYTES: number;
export declare const MAX_FILES_PER_REQUEST: number;
export declare const MAX_UPLOAD_REQUEST_BYTES: number;
export declare const ALLOWED_DOCUMENT_MIME_TYPES: string[];
export declare const ALLOWED_IMAGE_MIME_TYPES: string[];
export interface UploadOptions {
    folder: string;
    allowedMimeTypes: string[];
    maxFileSizeBytes?: number;
    maxFiles?: number;
}
export declare function buildUploadOptions(options: UploadOptions): MulterOptions;
export declare function noValidFilesException(allowedMimeTypes: string[]): BadRequestException;

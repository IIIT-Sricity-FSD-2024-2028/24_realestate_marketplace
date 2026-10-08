import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
export declare function backfillObjectIdStrings<T>(model: Model<T>, fields: string[], logger: Logger): Promise<void>;

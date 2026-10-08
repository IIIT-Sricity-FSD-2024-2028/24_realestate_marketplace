import { Connection } from 'mongoose';
import { PersistentCrudService } from '../../shared/services/persistent-crud.service.js';
export declare class BuyersService extends PersistentCrudService {
    constructor(connection: Connection);
}

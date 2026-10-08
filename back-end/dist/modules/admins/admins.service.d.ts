import { Connection } from 'mongoose';
import { PersistentCrudService } from '../../shared/services/persistent-crud.service.js';
export declare class AdminsService extends PersistentCrudService {
    constructor(connection: Connection);
}

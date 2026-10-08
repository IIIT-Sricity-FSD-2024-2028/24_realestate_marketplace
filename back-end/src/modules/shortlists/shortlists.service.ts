import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PersistentCrudService } from '../../shared/services/persistent-crud.service.js';

@Injectable()
export class ShortlistsService extends PersistentCrudService {
  constructor(@InjectConnection() connection: Connection) {
    super(connection, 'shortlists', 'shortlists');
  }
}

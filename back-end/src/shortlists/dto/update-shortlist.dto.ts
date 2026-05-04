import { PartialType } from '@nestjs/swagger';
import { CreateShortlistDto } from './create-shortlist.dto.js';

export class UpdateShortlistDto extends PartialType(CreateShortlistDto) {}

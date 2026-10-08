import { PartialType } from '@nestjs/swagger';
import { CreateBuyerDto } from './create-buyer.dto.js';

export class UpdateBuyerDto extends PartialType(CreateBuyerDto) {}

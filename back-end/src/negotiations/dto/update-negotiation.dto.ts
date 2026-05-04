import { PartialType } from '@nestjs/swagger';
import { CreateNegotiationDto } from './create-negotiation.dto.js';

export class UpdateNegotiationDto extends PartialType(CreateNegotiationDto) {}

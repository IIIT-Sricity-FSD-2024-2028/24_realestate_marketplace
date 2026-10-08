import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDocumentDto } from './create-property-document.dto.js';

export class UpdatePropertyDocumentDto extends PartialType(CreatePropertyDocumentDto) {}

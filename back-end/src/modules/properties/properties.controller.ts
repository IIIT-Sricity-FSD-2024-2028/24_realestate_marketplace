import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiExtraModels,
  ApiOkResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { PropertyResponseDto } from './dto/property-response.dto.js';
import { RejectPropertyDto } from './dto/reject-property.dto.js';
import { ReviewQueueFilterDto } from './dto/review-queue-filter.dto.js';
import { ListingFilterDto } from '../listings/dto/listing-filter.dto.js';
import { Role } from '../../common/enums/role.enum.js';
import { ApiRole } from '../../common/decorators/api-role.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import {
  ApiSuccessResponse,
  ApiNotFound,
  ApiValidationError,
} from '../../common/decorators/api-response.decorator.js';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_FILES_PER_REQUEST,
  buildUploadOptions,
  noValidFilesException,
} from '../../common/upload/upload.config.js';

@ApiTags('Properties')
@ApiExtraModels(PropertyResponseDto)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiRole(Role.USER)
  @ApiOperation({
    summary: 'Create a new property listing (seller accounts only)',
    description:
      'ONLY a seller account may list a property — admins and superusers cannot, and neither can ' +
      'buyers. An admin\'s authority over the catalogue is verify / reject / delete. The listing ' +
      'starts `verificationStatus: pending` and stays hidden from public search until an admin ' +
      'verifies it. Price must be positive, bedrooms 0–20, bathrooms 1–20.',
  })
  @ApiSuccessResponse(PropertyResponseDto, 201)
  @ApiValidationError()
  async create(@Body() dto: CreatePropertyDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.propertiesService.create(dto, user);
    return { message: 'Property created successfully', data };
  }

  @Get()
  @ApiOperation({
    summary: 'List and filter verified properties (paginated)',
    description:
      'Public search endpoint — only returns `verificationStatus: verified` listings. ' +
      'Supports filtering by city, state, type, listing type, status, price range, bedrooms, ' +
      'and area. Results are paginated (max 50 per page). If minPrice > maxPrice, a 400 error is returned.',
  })
  @ApiOkResponse({
    description: 'Paginated list of matching properties',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Properties retrieved successfully' },
        data: {
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/PropertyResponseDto' } },
            total: { type: 'number', example: 42 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  async findAll(@Query() filters: ListingFilterDto) {
    const data = await this.propertiesService.search(filters);
    return { message: 'Properties retrieved successfully', data };
  }

  @Get('mine')
  @ApiRole(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: "List the authenticated user's own properties",
    description:
      'For admins: every property they own. For sellers: every property they submitted, in ' +
      'any verification state (pending/verified/rejected).',
  })
  @ApiSuccessResponse(PropertyResponseDto, 200, true)
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.propertiesService.findByOwner(user.id);
    return { message: 'Your properties retrieved successfully', data };
  }

  @Get('review-queue')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Admin/superuser property review queue',
    description:
      'Every listing regardless of verification state, with the submitting seller\'s name/email ' +
      'populated where applicable. Filter by `verificationStatus` to see just pending submissions. ' +
      'Every admin sees the same full queue — no per-admin scoping.',
  })
  @ApiSuccessResponse(PropertyResponseDto, 200, true)
  async findForReview(@Query() filters: ReviewQueueFilterDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.propertiesService.findForReview(filters, user);
    return { message: 'Review queue retrieved successfully', data };
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get property by ID',
    description:
      'Returns a single property. Public endpoint — an optional bearer token is honored if present, ' +
      'so the private `documents` array is included only when the caller is the admin/superuser or ' +
      'the seller who owns this listing; everyone else gets `images` only.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PropertyResponseDto)
  @ApiNotFound('Property')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser | undefined) {
    const data = await this.propertiesService.findOne(id, user);
    return { message: 'Property retrieved successfully', data };
  }

  @Patch(':id')
  @ApiRole(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Update a property',
    description:
      'Partially updates a property. Only send fields to change. Admins/superusers can update ' +
      "any property; sellers may only update their own submissions, which resets them to " +
      '`verificationStatus: pending` for re-review.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PropertyResponseDto)
  @ApiNotFound('Property')
  @ApiValidationError()
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.propertiesService.update(id, dto, user);
    return { message: 'Property updated successfully', data };
  }

  @Patch(':id/verify')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Verify a pending property listing',
    description:
      'Marks the listing verified so it appears in public search. Any admin/superuser may verify — ' +
      'no per-admin restriction — see PropertiesService.assertCanVerify.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PropertyResponseDto)
  @ApiNotFound('Property')
  async verify(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const data = await this.propertiesService.verify(id, user);
    return { message: 'Property verified successfully', data };
  }

  @Patch(':id/reject')
  @ApiRole(Role.ADMIN)
  @ApiOperation({
    summary: 'Reject a pending property listing',
    description:
      'Marks the listing rejected, optionally with a reason. Any admin/superuser may act — no ' +
      'per-admin restriction.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PropertyResponseDto)
  @ApiNotFound('Property')
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectPropertyDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.propertiesService.reject(id, dto.reason, user);
    return { message: 'Property rejected', data };
  }

  @Post(':id/documents')
  @ApiRole(Role.ADMIN, Role.USER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @ApiOperation({
    summary: 'Upload verification documents for a property',
    description:
      'Up to 10 files (PDF/JPEG/PNG/WEBP, 10MB each). The property\'s owning seller, or any ' +
      'admin/superuser, may upload. Files are stored under /uploads and served statically.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PropertyResponseDto)
  @ApiNotFound('Property')
  // File-upload middleware. The storage layout, the random filename, the MIME
  // allow-list and the size caps all come from the shared upload config so every
  // upload route is protected identically — see common/upload/upload.config.ts.
  @UseInterceptors(
    FilesInterceptor(
      'files',
      MAX_FILES_PER_REQUEST,
      buildUploadOptions({
        folder: 'property-documents',
        allowedMimeTypes: ALLOWED_DOCUMENT_MIME_TYPES,
      }),
    ),
  )
  async uploadDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!files || files.length === 0) {
      throw noValidFilesException(ALLOWED_DOCUMENT_MIME_TYPES);
    }
    const safeId = id.replace(/[^a-fA-F0-9]/g, '');
    const uploaded = files.map((f) => ({
      url: `/uploads/property-documents/${safeId}/${f.filename}`,
      originalName: f.originalname,
    }));
    const data = await this.propertiesService.addDocuments(id, user, uploaded);
    return { message: 'Documents uploaded successfully', data };
  }

  @Post(':id/images')
  @ApiRole(Role.ADMIN, Role.USER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
    },
  })
  @ApiOperation({
    summary: 'Upload photos for a property',
    description:
      'Up to 10 files (JPEG/PNG/WEBP, 10MB each). These are the public, buyer-facing photos ' +
      "(shown in listings) — separate from /documents, which are private verification files only " +
      "the admin/superuser or owning seller can see. The property's owning seller, or any " +
      'admin/superuser, may upload.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiSuccessResponse(PropertyResponseDto)
  @ApiNotFound('Property')
  @UseInterceptors(
    FilesInterceptor(
      'files',
      MAX_FILES_PER_REQUEST,
      buildUploadOptions({
        folder: 'property-images',
        allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
      }),
    ),
  )
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!files || files.length === 0) {
      throw noValidFilesException(ALLOWED_IMAGE_MIME_TYPES);
    }
    const safeId = id.replace(/[^a-fA-F0-9]/g, '');
    const urls = files.map((f) => `/uploads/property-images/${safeId}/${f.filename}`);
    const data = await this.propertiesService.addImages(id, user, urls);
    return { message: 'Photos uploaded successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiRole(Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Delete a property',
    description:
      'Permanently deletes a property listing. Deleting is the only way an admin/superuser can ' +
      'remove a listing from the catalogue (they cannot create one) and they may delete any ' +
      'property; a seller may delete only their own submissions.',
  })
  @ApiParam({ name: 'id', description: 'Property ID', example: '65f1b2c3d4e5f6a7b8c9d0e1' })
  @ApiNotFound('Property')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.propertiesService.remove(id, user);
    return { message: 'Property deleted successfully', data: null };
  }
}

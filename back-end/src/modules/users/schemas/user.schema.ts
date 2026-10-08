import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../../common/enums/role.enum.js';

export type UserDocument = HydratedDocument<User>;

/** Optional display-only sub-category for Role.USER accounts (buyer/seller). */
export enum UserType {
  BUYER = 'buyer',
  SELLER = 'seller',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  name: string;

  // NOT globally unique: the same email may own separate buyer and seller
  // accounts (and a separate admin account). Uniqueness is enforced on the
  // (email, userType) pair below instead — see the compound index.
  @Prop({
    required: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  // Never returned to clients — excluded by default via `select: false`.
  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, enum: Role, default: Role.USER, index: true })
  role: Role;

  @Prop({ type: String, enum: UserType, default: null })
  userType: UserType | null;

  @Prop({ type: String, default: null })
  phone: string | null;

  /**
   * Informational location for this account. No longer used to route or
   * restrict anything — every admin/superuser can act on every property
   * regardless of city (per-location admin scoping was removed as it made
   * the workflow "clumsy" in practice; every admin now operates the same).
   */
  @Prop({ type: String, default: null, trim: true, index: true })
  city: string | null;

  @Prop({ type: String, default: null, trim: true })
  state: string | null;

  /** Blocked accounts cannot log in, and any already-issued token is rejected immediately. */
  @Prop({ type: Boolean, default: false, index: true })
  isBlocked: boolean;

  // Vestigial: the emailed reset-link flow was replaced by forgot-password
  // emailing a newly generated password (see AuthService.forgotPassword), so
  // nothing writes these any more. They are kept so UsersService.resetPassword
  // can $unset a token left on an account from before the switch.
  @Prop({ type: String, default: null, select: false })
  passwordResetTokenHash: string | null;

  @Prop({ type: Date, default: null, select: false })
  passwordResetExpires: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// A given email may exist at most once per userType: one buyer account, one
// seller account, and one admin/type-less account (userType: null) can all
// share the same email address, but two accounts of the *same* type cannot.
UserSchema.index({ email: 1, userType: 1 }, { unique: true });

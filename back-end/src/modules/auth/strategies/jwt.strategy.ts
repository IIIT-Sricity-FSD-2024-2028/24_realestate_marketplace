import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
import { AuthenticatedUser, JwtPayload } from '../interfaces/authenticated-user.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  /** Runs on every authenticated request; result becomes `request.user`. */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findDocumentById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('The account for this token no longer exists');
    }
    if (user.isBlocked) {
      // Rejects every request on an already-issued token the instant the
      // account is blocked — not just future login attempts.
      throw new UnauthorizedException('This account has been blocked. Please contact an administrator.');
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      userType: user.userType ?? null,
      city: user.city ?? null,
    };
  }
}

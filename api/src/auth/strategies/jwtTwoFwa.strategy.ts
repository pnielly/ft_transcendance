import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constant';
import { Request as RequestType } from 'express';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from '../interface/tokenPayload.interface';

@Injectable()
export class JwtStrategyTwoFactor extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategyTwoFactor.extractJWTcookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.userId);
    if (!user.isTwoFactorAuthenticationEnabled) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
  private static extractJWTcookie(req: RequestType): string | null {
    let token = req?.cookies['access_token'];
    if (!token) return null;
    return token;
  }
}

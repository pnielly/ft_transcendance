import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from 'src/users/entities/user.entities';
import { UsersService } from 'src/users/users.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(private readonly usersService: UsersService) {}

  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.username,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      secret,
    );

    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpauthUrl,
    };
  }

  async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }
}

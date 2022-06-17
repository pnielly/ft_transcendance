import {
  ClassSerializerInterceptor,
  Controller,
  Header,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  HttpCode,
  Body,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { Response } from 'express';
import RequestWithUser from '../interface/requestWithUser.interface';
import { UsersService } from 'src/users/users.service';
import { TwoFactorAuthenticationCodeDto } from '../dto/TwoFactorAuthenticationCode.dto';
import { AuthService } from '../auth.service';
import { Public } from 'src/utils/public-route';
import { JwtAuthGuard } from '../guards/jwt.guards';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('generate')
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        request.user,
      );

    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl,
    );
  }

  @Post('turn-on')
  @HttpCode(200)
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
    @Res() res: Response,
  ) {
    if (request.user.isTwoFactorAuthenticationEnabled) return;

    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.usersService.turnOnTwoFactorAuthentication(request.user.id);
    // Give new Cookie with 2fwa activate
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
      true,
    );
    res
      .cookie('access_token', accessTokenCookie.access_token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .send({ message: '2FWA TURN ON' });
  }

  @Get('turn-off')
  async turnOffTwoFactorAuthentification(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    if (!request.user.isTwoFactorAuthenticationEnabled) return;
    await this.usersService.turnOffTwoFactorAuthentification(request.user.id);
    // Return new Cookie without 2fwa
    const payload = await this.authService.login(request.user);
    response
      .cookie('access_token', payload.access_token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .send({ message: '2FWA turn off' });
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Post('authenticate')
  @HttpCode(200)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body()
    { twoFactorAuthenticationCode }: any,
    @Res() res: Response,
  ) {
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
      true,
    );
    res
      .cookie('access_token', accessTokenCookie.access_token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .send({ message: '2FWA AUTHENTICATE' });
  }
}

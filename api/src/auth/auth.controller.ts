import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { FortyTwoAuthGuard } from './guards/auth.guard';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from 'src/utils/public-route';
import RequestWithUser from './interface/requestWithUser.interface';
import { TwoFactorAuthenticationService } from './2fwa/twoFactorAuthentication.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorAuthService: TwoFactorAuthenticationService,
  ) {}

  /* createToken
    Call back for 42 auth , response are for browser (cookies)
  */

  @Public()
  @UseGuards(FortyTwoAuthGuard)
  @Get('/redirect')
  async createToken(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Only Find No create
    const payload = await this.authService.login(req.user);
    response.cookie('access_token', payload.access_token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    req.user.isTwoFactorAuthenticationEnabled
      ? response.redirect(`${process.env.URL_FRONT}/2fwa`)
      : response.redirect(`${process.env.URL_FRONT}/game`);
  }

  /*
    Fake Login for add User whitout 42
  */

  @Public()
  @Post('/fakelogin')
  async login(@Body() data: { username: string }, @Res() res: Response) {
    const user = await this.authService.validateCheatUser(data.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = await this.authService.login(user);
    res
      .cookie('access_token', payload.access_token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .send(user);
  }

  @Get('user')
  async getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return {
      message: 'Success',
    };
  }
}

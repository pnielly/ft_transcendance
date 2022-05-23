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
import { FortyTwoAuthGuard } from './auth.guard';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* createToken
    Call back for 42 auth , response are for browser (cookies)
  */

  @UseGuards(FortyTwoAuthGuard)
  @Get('/redirect')
  async createToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const payload = await this.authService.login(req.user);
    response
      .cookie('access_token', payload.access_token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .redirect('http://localhost:3000');
  }

  /*
    Fake Login for add User whitout 42
  */

  @Post('/fakelogin')
  async login(@Body() data: { username: string }, @Res() res: Response) {
    const user = await this.authService.validateCheatUser(data.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = await this.authService.login(data);
    res
      .cookie('access_token', payload.access_token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .send(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getProfile(@Req() req: Request) {
    return this.authService.findMe(req.user);
  }
}

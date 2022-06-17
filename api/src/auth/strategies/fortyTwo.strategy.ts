import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy, Profile } from 'passport-42';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.FORTYTWO_CLIENT,
      clientSecret: process.env.FORTYTWO_SECRET,
      callbackURL: process.env.FORTYTWO_CALLBACK_URL,
      profileFields: {
        id: 'id',
        username: 'login',
        'photos.0.value': 'image_url',
      },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = {
      id_42: profile.id,
      username: profile.username,
      avatar: profile['photos'][0]['value'],
      password: '',
    };
    return await this.authService.findOrCreate42(user);
  }
}

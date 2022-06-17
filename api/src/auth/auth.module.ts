import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './strategies/fortyTwo.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constant';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFactorAuthenticationService } from './2fwa/twoFactorAuthentication.service';
import { TwoFactorAuthenticationController } from './2fwa/twoFactorAuthentification.controller';
import { JwtStrategyTwoFactor } from './strategies/jwtTwoFwa.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    AuthService,
    FortyTwoStrategy,
    JwtStrategy,
    TwoFactorAuthenticationService,
    JwtStrategyTwoFactor,
  ],
  controllers: [AuthController, TwoFactorAuthenticationController],
  exports: [AuthService],
})
export class AuthModule {}

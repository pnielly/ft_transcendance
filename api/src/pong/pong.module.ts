import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MatchModule } from 'src/match/match.module';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';

@Module({
  imports: [MatchModule, AuthModule],
  providers: [PongService, PongGateway],
  exports: [PongGateway],
})
export class PongModule {}

import { Module } from '@nestjs/common';
import { MatchModule } from 'src/match/match.module';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';

@Module({
  imports: [MatchModule],
  providers: [PongService, PongGateway],
  exports: [PongGateway],
})
export class PongModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { EloController } from './elo.controller';
import { EloService } from './elo.service';
import { Elo } from './entities/elo.entity';
import { Match } from './entities/match.entity';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Elo]), UsersModule],
  controllers: [MatchController, EloController],
  providers: [MatchService, EloService],
  exports: [MatchService],
})
export class MatchModule {}

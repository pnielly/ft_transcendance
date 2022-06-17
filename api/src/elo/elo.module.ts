import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Elo } from 'src/match/entities/elo.entity';
import { EloController } from './elo.controller';
import { EloService } from './elo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Elo])],
  controllers: [EloController],
  providers: [EloService],
  exports: [EloService],
})
export class EloModule {}

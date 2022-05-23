import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { userInfo } from 'src/pong/interfaces/pong.interfaces';
import { UsersService } from 'src/users/users.service';
import { Repository, UpdateDateColumn } from 'typeorm';
import { Elo } from './entities/elo.entity';

@Injectable()
export class EloService {
  constructor(
    @InjectRepository(Elo)
    private readonly eloRepository: Repository<Elo>,
    private readonly userService: UsersService,
  ) {}

  async findOrCreateElo(player: userInfo): Promise<Elo> {
    const elo = await this.eloRepository.findOne({
      relations: ['user'],
      where: { user: { id: player.id } },
    });
    if (!elo) {
      const user = await this.userService.findOne(player.id);
      const elo = new Elo();
      elo.user = user;
      elo.rank = 800;
      elo.defeat = 0;
      elo.win = 0;
      return this.eloRepository.save(elo);
    }
    return elo;
  }

  sortByRank(A: Elo, B: Elo) {
    if (A.rank > B.rank) return -1;
    if (A.rank < B.rank) return 1;
    return 0;
  }

  async getRanking() {
    const ranking: Elo[] = await this.eloRepository.find({
      relations: ['user'],
    });
    return ranking.sort(this.sortByRank);
  }

  save(par: Elo, par2: Elo) {
    this.eloRepository.save([par, par2]);
  }

  async removeAll() {
    const allElo = await this.eloRepository.find();
    for (let i = 0; i < allElo.length; i++) {
      this.eloRepository.remove(allElo[i]);
    }
  }

  async findRankingOfOneUser(userId: number) {
    const Elo = await this.eloRepository.findOne({
      relations: ['user'],
      where: { user: { id: userId } },
    });
    if (!Elo) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return Elo;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { userInfo } from 'src/pong/interfaces/pong.interfaces';
import { User } from 'src/users/entities/user.entities';
import { UsersService } from 'src/users/users.service';
import { Repository, UpdateDateColumn } from 'typeorm';
import { PaginationQueryDto } from '../match/dto/pagination-query.dto';
import { Elo } from '../match/entities/elo.entity';

@Injectable()
export class EloService {
  constructor(
    @InjectRepository(Elo)
    private readonly eloRepository: Repository<Elo>,
  ) {}

  create(user: User) {
    const elo = new Elo();
    elo.user = user;
    elo.defeat = 0;
    elo.win = 0;
    elo.points = 800;
    return this.eloRepository.save(elo);
  }

  async findElo(player: userInfo): Promise<Elo> {
    const elo = await this.eloRepository.findOne({
      relations: ['user'],
      where: { user: { id: player.id } },
    });
    if (!elo)
      throw new NotFoundException(`Player ${player.username} elo not found!`);
    return elo;
  }

  sortByRank(A: Elo, B: Elo) {
    if (A.points > B.points) return -1;
    if (A.points < B.points) return 1;
    return 0;
  }

  async getRanking(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    const ranking: Elo[] = await this.eloRepository.find({
      relations: ['user'],
    });
    if (limit) {
      return ranking.sort(this.sortByRank).slice(0, 5);
    }
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

  async findRankingOfOneUser(userId: string) {
    const Elo = await this.eloRepository.findOne({
      relations: ['user'],
      where: { user: { id: userId } },
    });
    if (!Elo) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return Elo;
  }

  async findStatsOfOneUser(userId: string) {
    const Elo = await this.eloRepository.findOne({
      relations: ['user'],
      where: { user: { id: userId } },
    });
    if (!Elo) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    return Elo.toResponseObject();
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entities';
import { TokenPayload } from './interface/tokenPayload.interface';
import typeUser from 'src/users/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async findOrCreate(UserDto: CreateUserDto) {
    return await this.userService.findOrCreate(UserDto);
  }

  async findOrCreate42(UserDto: CreateUserDto) {
    return await this.userService.findOrCreate42(UserDto);
  }

  async login(user: typeUser) {
    const payload: { userId: string; isSecondFactorAuthenticated: boolean } = {
      userId: user.id,
      isSecondFactorAuthenticated: false,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findMe(user: User) {
    const dbUser = await this.userService.findOne(user.id);
    return dbUser;
  }

  getCookieWithJwtAccessToken(
    userId: string,
    isSecondFactorAuthenticated = false,
  ) {
    const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
    return { access_token: this.jwtService.sign(payload) };
  }

  async verifyJwt(jwtToken: string) {
    return this.jwtService.verifyAsync(jwtToken);
  }

  /*
    Cheat code for for add new user whithout 42 
  */

  async validateCheatUser(username: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user) return user;
    return null;
  }
}

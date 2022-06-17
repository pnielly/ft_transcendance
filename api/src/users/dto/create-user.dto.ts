import { IsOptional, IsString, Length, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 20)
  readonly username: string;

  @IsString()
  @IsOptional()
  readonly password: string;

  @IsString()
  @IsOptional()
  readonly avatar: string;

  @IsString()
  @IsOptional()
  readonly id_42: string;
}

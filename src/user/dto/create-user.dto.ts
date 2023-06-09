import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ROLE } from 'src/helpers/role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(12)
  @Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{8,12}$/, {
    message:
      'Your password must be longer than 8 characters and shorter than 12 characters, contain at least one number and have a mixture of uppercase and lowercase letters.',
  })
  password: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  role?: ROLE;
}

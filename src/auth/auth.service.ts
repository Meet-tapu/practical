import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login-dto';
import ResponseDto from 'src/utils/response.dto';
import {
  EMAIL_NOT_SENT_MESSAGE,
  FORGOT_PASSWORD_SENT,
  INCORRECT_EMAIL_MESSAGE,
  INVALID_LOGIN_CREDENTIALS_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from 'src/helpers/message';
import { JwtPayloadDto } from 'src/utils/jwt-payload.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly mailerService: MailerService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginDto): Promise<ResponseDto> {
    try {
      const user = await this.userService.getUserByEmail(loginDto.email);

      if (!user) {
        throw new UnauthorizedException(INCORRECT_EMAIL_MESSAGE);
      }

      const passwordValidate = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!passwordValidate) {
        throw new UnauthorizedException(INVALID_LOGIN_CREDENTIALS_MESSAGE);
      }

      const payload: JwtPayloadDto = { email: user.email, role: user.role };
      const accessToken: string = await this.jwtService.sign(payload);

      const { id, username, email } = user;

      return {
        accessToken,
        statusCode: 201,
        data: { id, username, email },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException(INCORRECT_EMAIL_MESSAGE);
      }

      const token = uuidv4();
      const expires_at = new Date(Date.now() + 15 * 60 * 1000);

      user.reset_password_token = token;
      user.reset_password_token_expire_time = expires_at;

      await this.userRepository.save(user);

      const resetUrl = `https://localhost:3000/reset-password?token=${token}`;

      const res = await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset',
        text: `Please click on this link to reset your password: ${resetUrl}`,
      });

      if (!res) {
        return EMAIL_NOT_SENT_MESSAGE;
      }

      return {
        statusCode: 201,
        message: FORGOT_PASSWORD_SENT,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

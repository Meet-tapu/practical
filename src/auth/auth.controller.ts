import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import ResponseDto from 'src/utils/response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<ResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<ResponseDto> {
    return this.authService.forgotPassword(email);
  }
}

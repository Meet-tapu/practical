import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import ResponseDto from 'src/utils/response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from './entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { ROLE } from 'src/helpers/role.enum';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.SUPER_ADMIN)
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ResponseDto> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.SUB_ADMIN)
  @Get()
  getUsers(
    @Query('search') search: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<ResponseDto> {
    return this.userService.getUsers(search, paginationDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.USER)
  @Put(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto> {
    return await this.userService.updateUserById(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.USER)
  @Patch('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ): Promise<ResponseDto> {
    return this.userService.changePassword(changePasswordDto, user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(ROLE.SUPER_ADMIN)
  @Delete(':id')
  async deleteUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto> {
    return this.userService.deleteUserById(id);
  }
}

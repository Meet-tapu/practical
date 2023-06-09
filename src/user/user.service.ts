import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  EMAIL_ALREADY_EXISTS_MESSAGE,
  INCORRECT_PASSWORD_MESSAGE,
  PASSWORD_CHANGED_MESSAGE,
  PASSWORD_SAME_MESSAGE,
  USERS_NOT_FOUND_MESSAGE,
  USER_CREATED_MESSAGE,
  USER_DELETED_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
  USER_UPDATED_MESSAGE,
} from 'src/helpers/message';
import * as bcrypt from 'bcrypt';
import ResponseDto from 'src/utils/response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<ResponseDto> {
    try {
      const { username, email, password, role } = createUserDto;

      const existingUser = await this.getUserByEmail(email);

      if (existingUser) {
        throw new BadRequestException(EMAIL_ALREADY_EXISTS_MESSAGE);
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        role,
      });

      await this.userRepository.save(user);
      user.password = undefined;

      return {
        statusCode: 201,
        message: USER_CREATED_MESSAGE,
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUsers(
    search: string,
    paginationDto: PaginationDto,
  ): Promise<ResponseDto> {
    try {
      let { page, limit } = paginationDto;

      page = page || 1;
      limit = limit || 5;

      const skip = (page - 1) * limit;

      const query = this.userRepository.createQueryBuilder('user');

      if (search) {
        query.andWhere('LOWER(user.username) LIKE LOWER(:search)', {
          search: `%${search}%`,
        });
      }

      const users = await query
        .select([
          'user.id',
          'user.username',
          'user.email',
          'user.created_at',
          'user.updated_at',
        ])
        .skip(skip)
        .take(limit)
        .getMany();

      if (users.length === 0) {
        return {
          statusCode: 200,
          message: USERS_NOT_FOUND_MESSAGE,
          data: [],
        };
      }

      return {
        statusCode: 200,
        data: users,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Internal method
  async getUserByEmail(email: string): Promise<User> {
    try {
      const result = await this.userRepository.findOne({ where: { email } });

      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto> {
    try {
      const existinguser = await this.userRepository.findOne({
        where: { id, is_active: true },
      });

      if (!existinguser) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }

      const user = new User();
      user.username = updateUserDto.username;
      user.is_active = updateUserDto.is_active;

      const result = await this.userRepository.update(id, user);

      if (result.affected > 0) {
        return {
          statusCode: 201,
          message: USER_UPDATED_MESSAGE,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: User,
  ): Promise<ResponseDto> {
    try {
      const { password, new_password } = changePasswordDto;

      const passwordvalidation = await bcrypt.compare(password, user.password);

      if (!passwordvalidation) {
        throw new BadRequestException(INCORRECT_PASSWORD_MESSAGE);
      }

      if (password === new_password) {
        throw new BadRequestException(PASSWORD_SAME_MESSAGE);
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(new_password, salt);

      user.password = hashedPassword;
      await this.userRepository.save(user);

      return {
        statusCode: 200,
        message: PASSWORD_CHANGED_MESSAGE,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUserById(id: number): Promise<ResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id, is_active: true },
      });

      if (!user) {
        throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
      }
      const result = await this.userRepository.delete(id);

      if (result.affected > 0) {
        return {
          statusCode: 201,
          message: USER_DELETED_MESSAGE,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

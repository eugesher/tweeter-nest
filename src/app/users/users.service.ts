import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUserResponse } from './interfaces/user-response.interface';
import { IProfileResponse } from './interfaces/profile-response.interface';
import {
  EMAIL_TAKEN,
  INVALID_CREDENTIALS,
  NOT_FOUND,
  USERNAME_TAKEN,
} from './constants/users.constants';
import { IProfileResponse } from './interfaces/profile-response.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  generateJwt(user: User): string {
    const { id, username, email } = user;
    return sign({ id, username, email }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  buildUserResponse(user: User, options = { withToken: false }): IUserResponse {
    delete user.password;

    return {
      ...user,
      token: options.withToken ? this.generateJwt(user) : undefined,
    };
  }

  buildProfileResponse(user: User): IProfileResponse {
    delete user.email;
    delete user.createdAt;
    delete user.updatedAt;

    return { ...user, isFollowing: false };
  }

  async signup(dto: CreateUserDto): Promise<User> {
    switch (true) {
      case Boolean(await this.userRepository.findOne({ email: dto.email })):
        throw new UnprocessableEntityException(EMAIL_TAKEN);
      case Boolean(
        await this.userRepository.findOne({ username: dto.username }),
      ):
        throw new UnprocessableEntityException(USERNAME_TAKEN);
      default:
        const user = new User();
        Object.assign(user, dto);
        return await this.userRepository.save(user);
    }
  }

  async signin(dto: LoginUserDto): Promise<User> {
    let user = await this.userRepository.findOne(
      { email: dto.email },
      { select: ['id', 'password'] },
    );

    switch (false) {
      case Boolean(user):
        throw new ForbiddenException(INVALID_CREDENTIALS);
      case await compare(dto.password, user.password):
        throw new ForbiddenException(INVALID_CREDENTIALS);
      default:
        user = await this.findOne({ id: user.id });
        return user;
    }
  }

  async findOne(conditions: FindConditions<User>): Promise<User> {
    const user = await this.userRepository.findOne(conditions);

    if (!user) {
      throw new NotFoundException(NOT_FOUND);
    } else {
      return user;
    }
  }

  async update(currentUserId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne({ id: currentUserId });
    Object.assign(user, dto);
    return await this.userRepository.save(user);
  }
}

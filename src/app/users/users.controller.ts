import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from './guards/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { IUserResponse } from './interfaces/user-response.interface';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto): Promise<IUserResponse> {
    const user = await this.usersService.signup(dto);
    return this.usersService.buildUserResponse(user);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: LoginUserDto): Promise<IUserResponse> {
    const user = await this.usersService.signin(dto);
    return this.usersService.buildUserResponse(user, { withToken: true });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrent(@CurrentUser() currentUser: User): Promise<IUserResponse> {
    return this.usersService.buildUserResponse(currentUser);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateCurrent(
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(currentUserId, dto);
    return this.usersService.buildUserResponse(user);
  }
}

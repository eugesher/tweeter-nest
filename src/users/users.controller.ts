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
import { UserResponseInterface } from './types/user-response.interface';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto): Promise<UserResponseInterface> {
    const user = await this.usersService.signup(dto);
    delete user.password;
    return this.usersService.buildUserResponse(user);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.usersService.signin(dto);
    return this.usersService.buildUserResponse(user, { withToken: true });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrent(
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseInterface> {
    return this.usersService.buildUserResponse(currentUser);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateCurrent(
    @CurrentUser('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    delete user.password;
    return this.usersService.buildUserResponse(user);
  }
}

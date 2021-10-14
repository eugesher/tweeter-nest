import {
  Controller,
  Post,
  Body,
  UseGuards,
  Query,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { TweetsService } from './tweets.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { FindTweetsQueryInterface } from './types/find-tweets-query.interface';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@Controller('tweets')
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateTweetDto,
    @CurrentUser() currentUser: User,
  ): Promise<Tweet> {
    return await this.tweetsService.create(dto, currentUser);
  }

  @Get()
  async findAll(@Query('') query: FindTweetsQueryInterface): Promise<Tweet[]> {
    return await this.tweetsService.findAll(query);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.tweetsService.remove(id, currentUserId);
  }
}

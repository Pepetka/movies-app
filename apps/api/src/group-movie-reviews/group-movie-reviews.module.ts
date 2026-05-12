import { Module } from '@nestjs/common';

import { GroupMoviesModule } from '$src/group-movies/group-movies.module';

import { GroupMovieReviewsController } from './group-movie-reviews.controller';
import { GroupMovieReviewsRepository } from './group-movie-reviews.repository';
import { GroupMovieReviewsService } from './group-movie-reviews.service';
import { GroupsModule } from '../groups/groups.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, GroupsModule, GroupMoviesModule],
  controllers: [GroupMovieReviewsController],
  providers: [GroupMovieReviewsService, GroupMovieReviewsRepository],
  exports: [GroupMovieReviewsService],
})
export class GroupMovieReviewsModule {}

import { Module } from '@nestjs/common';

import { GroupMoviesModule } from '$src/group-movies/group-movies.module';
import { GroupsModule } from '$src/groups/groups.module';
import { DbModule } from '$src/db/db.module';

import { GroupMovieReviewsController } from './group-movie-reviews.controller';
import { GroupMovieReviewsRepository } from './group-movie-reviews.repository';
import { GroupMovieReviewReactionsRepository } from './reactions.repository';
import { GroupMovieReviewsService } from './group-movie-reviews.service';
import { ReviewAuthorGuard } from './guards';

@Module({
  imports: [DbModule, GroupsModule, GroupMoviesModule],
  controllers: [GroupMovieReviewsController],
  providers: [
    GroupMovieReviewsService,
    GroupMovieReviewsRepository,
    GroupMovieReviewReactionsRepository,
    ReviewAuthorGuard,
  ],
  exports: [GroupMovieReviewsService],
})
export class GroupMovieReviewsModule {}

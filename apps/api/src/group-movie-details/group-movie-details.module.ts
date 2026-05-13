import { Module } from '@nestjs/common';

import { GroupMovieReviewsModule } from '$src/group-movie-reviews/group-movie-reviews.module';
import { GroupMoviesModule } from '$src/group-movies/group-movies.module';
import { GroupsModule } from '$src/groups/groups.module';

import { GroupMovieDetailsController } from './group-movie-details.controller';
import { GroupMovieDetailsService } from './group-movie-details.service';

@Module({
  imports: [GroupMoviesModule, GroupMovieReviewsModule, GroupsModule],
  controllers: [GroupMovieDetailsController],
  providers: [GroupMovieDetailsService],
})
export class GroupMovieDetailsModule {}

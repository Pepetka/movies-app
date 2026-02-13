import { Module } from '@nestjs/common';

import { CustomMoviesModule } from '../custom-movies/custom-movies.module';
import { GroupMoviesRepository } from './group-movies.repository';
import { GroupMoviesController } from './group-movies.controller';
import { GroupMoviesService } from './group-movies.service';
import { MoviesModule } from '../movies/movies.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, MoviesModule, CustomMoviesModule],
  controllers: [GroupMoviesController],
  providers: [GroupMoviesService, GroupMoviesRepository],
  exports: [GroupMoviesService],
})
export class GroupMoviesModule {}

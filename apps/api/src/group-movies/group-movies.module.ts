import { Module } from '@nestjs/common';

import { GroupMoviesRepository } from './group-movies.repository';
import { GroupMoviesController } from './group-movies.controller';
import { GroupMoviesService } from './group-movies.service';
import { MoviesModule } from '../movies/movies.module';
import { GroupsModule } from '../groups/groups.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, MoviesModule, GroupsModule],
  controllers: [GroupMoviesController],
  providers: [GroupMoviesService, GroupMoviesRepository],
  exports: [GroupMoviesService],
})
export class GroupMoviesModule {}

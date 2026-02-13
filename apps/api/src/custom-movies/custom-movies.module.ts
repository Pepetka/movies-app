import { Module } from '@nestjs/common';

import { CustomMoviesRepository } from './custom-movies.repository';
import { CustomMoviesController } from './custom-movies.controller';
import { CustomMoviesService } from './custom-movies.service';
import { MoviesModule } from '../movies/movies.module';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule, MoviesModule],
  controllers: [CustomMoviesController],
  providers: [CustomMoviesService, CustomMoviesRepository],
  exports: [CustomMoviesService],
})
export class CustomMoviesModule {}

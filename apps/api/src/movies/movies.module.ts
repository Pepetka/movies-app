import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { MoviesController } from './movies.controller';
import { MoviesRepository } from './movies.repository';
import { KINOPOISK_API_OPTIONS } from './providers';
import { MovieProvidersService } from './providers';
import { MoviesService } from './movies.service';
import { KinopoiskService } from './providers';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [MoviesController],
  providers: [
    MoviesRepository,
    MoviesService,
    {
      provide: KINOPOISK_API_OPTIONS,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.getOrThrow<string>('KINOPOISK_API_KEY');
        const baseUrl = configService.getOrThrow<string>('KINOPOISK_BASE_URL');
        return { baseUrl, apiKey };
      },
      inject: [ConfigService],
    },
    KinopoiskService,
    MovieProvidersService,
  ],
  exports: [
    MoviesService,
    KinopoiskService,
    MoviesRepository,
    MovieProvidersService,
  ],
})
export class MoviesModule {}

import { Injectable } from '@nestjs/common';
import { parse } from 'valibot';

import { AppConfig, configSchema, Environment } from './app-config.schema';

@Injectable()
export class AppConfigService {
  private readonly _config: AppConfig;

  constructor() {
    this._config = parse(configSchema, process.env);
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this._config[key];
  }

  get isProd(): boolean {
    return this._config.NODE_ENV === Environment.Production;
  }
  get isDev(): boolean {
    return this._config.NODE_ENV === Environment.Development;
  }
  get isTest(): boolean {
    return this._config.NODE_ENV === Environment.Test;
  }
}

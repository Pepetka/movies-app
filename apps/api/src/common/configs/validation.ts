import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  registerDecorator,
  validateSync,
  type ValidationOptions,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

class IsCommaSeparatedUrlsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const urls = value
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) return false;
    return urls.every((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
  }

  defaultMessage(): string {
    return 'WEB_URL must be a comma-separated list of valid URLs';
  }
}

function IsCommaSeparatedUrls(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCommaSeparatedUrlsConstraint,
    });
  };
}

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  // Comma-separated list of allowed CORS origins
  @IsCommaSeparatedUrls()
  WEB_URL: string;

  @IsUrl({ require_tld: false })
  API_URL: string;

  @IsString()
  COOKIE_SECRET: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRATION: string;

  @IsString()
  JWT_REFRESH_EXPIRATION: string;

  @IsString()
  KINOPOISK_API_KEY: string;

  @IsUrl({ require_tld: false })
  KINOPOISK_BASE_URL: string;

  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(16)
  BCRYPT_ROUNDS: number;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  GOOGLE_REDIRECT_URI?: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  return {
    ...validatedConfig,
    BCRYPT_ROUNDS: validatedConfig.BCRYPT_ROUNDS ?? 12,
    JWT_ISSUER: `movies-app-${validatedConfig.NODE_ENV}`,
  };
};

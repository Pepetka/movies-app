import { HttpException, HttpStatus } from '@nestjs/common';

export class KinopoiskApiException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_GATEWAY);
  }
}

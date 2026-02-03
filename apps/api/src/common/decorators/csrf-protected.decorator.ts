import { SetMetadata } from '@nestjs/common';

export const CSRF_PROTECTED_KEY = Symbol('csrfProtected');

export const CsrfProtected = () => SetMetadata(CSRF_PROTECTED_KEY, true);

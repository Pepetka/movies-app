export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface ValidationResult<T> {
	isValid: boolean;
	data: T | null;
	errors: Record<string, string>;
}

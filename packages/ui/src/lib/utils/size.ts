export type IconSize = 'sm' | 'md' | 'lg';

export const getIconSize = (size: IconSize): number => {
	switch (size) {
		case 'sm':
			return 16;
		case 'md':
			return 20;
		case 'lg':
			return 24;
		default:
			return 20;
	}
};

export type ThemeSize = 'sm' | 'md' | 'lg';

export const getThemeButtonIconSize = (size: ThemeSize): number => {
	switch (size) {
		case 'sm':
			return 20;
		case 'md':
			return 24;
		case 'lg':
			return 28;
		default:
			return 24;
	}
};

export const getThemeButtonPadding = (size: ThemeSize): number => {
	switch (size) {
		case 'sm':
			return 6;
		case 'md':
			return 8;
		case 'lg':
			return 10;
		default:
			return 8;
	}
};

export const getThemeToggleIconSize = (size: ThemeSize): number => {
	switch (size) {
		case 'sm':
			return 18;
		case 'md':
			return 24;
		case 'lg':
			return 28;
		default:
			return 24;
	}
};

export const getThemeTogglePadding = (size: ThemeSize): number => {
	switch (size) {
		case 'sm':
			return 4;
		case 'md':
			return 4;
		case 'lg':
			return 6;
		default:
			return 4;
	}
};

export const getThemeToggleGap = (size: ThemeSize): number => {
	switch (size) {
		case 'sm':
			return 4;
		case 'md':
			return 4;
		case 'lg':
			return 6;
		default:
			return 4;
	}
};

export const getThemeToggleButtonPadding = (size: ThemeSize): number => {
	switch (size) {
		case 'sm':
			return 5;
		case 'md':
			return 8;
		case 'lg':
			return 10;
		default:
			return 8;
	}
};

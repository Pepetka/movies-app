export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const getAvatarIconSize = (size: AvatarSize): number => {
	switch (size) {
		case 'xs':
			return 14;
		case 'sm':
			return 18;
		case 'md':
			return 24;
		case 'lg':
			return 32;
		case 'xl':
			return 48;
		default:
			return 24;
	}
};

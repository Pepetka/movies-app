export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const AVATAR_COLORS = [
	'var(--avatar-color-1)',
	'var(--avatar-color-2)',
	'var(--avatar-color-3)',
	'var(--avatar-color-4)',
	'var(--avatar-color-5)',
	'var(--avatar-color-6)',
	'var(--avatar-color-7)',
	'var(--avatar-color-8)'
] as const;

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

export const getAvatarColor = (name: string): string => {
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getAvatarInitials = (name: string): string => {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
};

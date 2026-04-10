export const OVERLAY_FADE = { duration: 200 };

export const MODAL_FLY = { y: 20, duration: 200 };

export const DRAWER_FLY = {
	left: (size: string) => ({ x: `-${size || '320px'}`, duration: 200 }),
	right: (size: string) => ({ x: size || '320px', duration: 200 }),
	bottom: { y: '100%', duration: 200 }
};

export const DROPDOWN_FLY = {
	top: { y: 20, duration: 200 },
	bottom: { y: -20, duration: 200 }
};

const DURATION = 200;

export const OVERLAY_FADE = { duration: DURATION };

export const MODAL_FLY = { y: 20, duration: DURATION };

export const DRAWER_FLY = {
	left: (size: string) => ({ x: `-${size || '320px'}`, duration: DURATION }),
	right: (size: string) => ({ x: size || '320px', duration: DURATION }),
	bottom: { y: '100%', duration: DURATION }
};

export const DROPDOWN_FLY = {
	top: { y: 20, duration: DURATION },
	bottom: { y: -20, duration: DURATION }
};

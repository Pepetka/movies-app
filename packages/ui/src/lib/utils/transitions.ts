export const OVERLAY_FADE = { duration: 150 };

export const MODAL_FLY = { y: 20, duration: 150 };

export const DRAWER_FLY = {
	left: (size: number) => ({ x: -(size || 320), duration: 150 }),
	right: (size: number) => ({ x: size || 320, duration: 150 }),
	bottom: { y: 500, duration: 200 }
};

export const DROPDOWN_FLY = {
	top: { y: 20, duration: 150 },
	bottom: { y: -20, duration: 150 }
};

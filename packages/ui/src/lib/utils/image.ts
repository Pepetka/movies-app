export const isImageCached = (url: string | undefined | null): boolean => {
	if (!url) return false;
	const img = new Image();
	img.src = url;
	return img.complete && img.naturalHeight > 0;
};

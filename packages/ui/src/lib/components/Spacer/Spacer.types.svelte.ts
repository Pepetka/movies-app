import type { HTMLAttributes } from 'svelte/elements';

export type SpacerSize = '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24';

export interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, 'size'> {
	size?: SpacerSize;
	class?: string;
}

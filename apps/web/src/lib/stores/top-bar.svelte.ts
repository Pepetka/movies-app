import type { Icon as IconType } from '@lucide/svelte';

export interface TopBarAction {
	Icon: typeof IconType;
	label: string;
	onclick: () => void;
}

interface TopBarState {
	title?: string;
	trailingAction?: TopBarAction;
}

class TopBarStore {
	private _state = $state<TopBarState>({});

	get isShow(): boolean {
		return !!this._state.title || !!this._state.trailingAction;
	}

	get title(): string | undefined {
		return this._state.title;
	}

	get trailingAction(): TopBarAction | undefined {
		return this._state.trailingAction;
	}

	configure(config: TopBarState): void {
		this._state = config;
	}

	reset(): void {
		this._state = {};
	}
}

export const topBarStore = new TopBarStore();

import type { ReactionEmoji } from '../constants/reactions';

export interface IProps {
	ownEmoji?: ReactionEmoji;
	disabled?: boolean;
	onSelect: (emoji: ReactionEmoji) => void;
}

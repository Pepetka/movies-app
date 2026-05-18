export interface IProps {
	ownEmoji?: string;
	disabled?: boolean;
	onSelect: (emoji: string) => void;
}

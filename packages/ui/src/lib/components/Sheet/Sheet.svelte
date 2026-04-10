<script lang="ts">
	import type { IProps } from './Sheet.types.svelte';
	import { isDesktop } from '../../utils/media';
	import { Drawer } from '../Drawer';
	import { Modal } from '../Modal';

	let {
		open = $bindable(false),
		size = 'md',
		closeOnOverlay = true,
		closeOnEscape = true,
		onClose,
		class: className,
		children,
		header,
		drawerHeader,
		footer
	}: IProps = $props();
</script>

{#if isDesktop.current}
	<Modal
		bind:open
		{size}
		{closeOnOverlay}
		{closeOnEscape}
		{onClose}
		class={className}
		{header}
		{footer}
	>
		{@render children?.()}
	</Modal>
{:else}
	<Drawer
		bind:open
		position="bottom"
		{closeOnOverlay}
		{closeOnEscape}
		{onClose}
		class={className}
		header={drawerHeader ?? header}
		{footer}
	>
		{@render children?.()}
	</Drawer>
{/if}

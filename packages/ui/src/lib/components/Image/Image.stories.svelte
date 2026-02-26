<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { Snippet } from 'svelte';

	import type { IProps } from './Image.types.svelte';
	import Image from './Image.svelte';

	const { Story } = defineMeta({
		title: 'Components/Image',
		component: Image,
		tags: ['autodocs'],
		argTypes: {
			ratio: {
				control: 'select',
				options: ['1/1', '4/3', '16/9', '2/3', '3/4']
			},
			objectFit: {
				control: 'select',
				options: ['cover', 'contain', 'fill', 'none', 'scale-down']
			}
		}
	});

	export type Args = IProps & { fallback?: Snippet };
</script>

<script lang="ts">
	import { ImageOff } from '@lucide/svelte';
</script>

<Story
	name="Playground"
	args={{
		src: 'https://api.dicebear.com/7.x/shapes/png?seed=movie1',
		alt: 'Movie poster',
		ratio: '2/3',
		rounded: true,
		width: 200,
		loading: 'eager'
	}}
/>

<Story name="Aspect Ratios">
	{#snippet template()}
		<div style="display: flex; gap: 16px; flex-wrap: wrap;">
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">1/1</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=square"
					ratio="1/1"
					width={120}
					rounded
					loading="eager"
				/>
			</div>
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">4/3</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=fourbythree"
					ratio="4/3"
					width={120}
					rounded
					loading="eager"
				/>
			</div>
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">16/9</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=widescreen"
					ratio="16/9"
					width={160}
					rounded
					loading="eager"
				/>
			</div>
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">2/3 (Poster)</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=poster"
					ratio="2/3"
					width={120}
					rounded
					loading="eager"
				/>
			</div>
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">3/4</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=portrait"
					ratio="3/4"
					width={120}
					rounded
					loading="eager"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Without Source (Fallback)">
	{#snippet template()}
		<div style="display: flex; gap: 16px;">
			<Image ratio="2/3" width={120} rounded />
			<Image ratio="16/9" width={200} rounded />
		</div>
	{/snippet}
</Story>

<Story name="Loading State (Skeleton)">
	{#snippet template()}
		<div style="display: flex; gap: 16px;">
			<Image ratio="2/3" width={120} rounded skeleton />
			<Image ratio="16/9" width={200} rounded skeleton />
		</div>
	{/snippet}
</Story>

<Story name="Loading State with Image">
	{#snippet template()}
		<div style="display: flex; gap: 16px;">
			<Image
				src="https://api.dicebear.com/7.x/shapes/png?seed=movie1"
				ratio="2/3"
				width={120}
				rounded
				skeleton
				loading="eager"
			/>
			<Image
				src="https://api.dicebear.com/7.x/shapes/png?seed=movie2"
				ratio="16/9"
				width={200}
				rounded
				skeleton
				loading="eager"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<div style="display: flex; gap: 16px;">
			<Image src="wrongprotocol://invalid-url.com/image.jpg" ratio="2/3" width={120} rounded />
			<Image src="wrongprotocol://invalid-url.com/image.jpg" ratio="16/9" width={200} rounded />
		</div>
	{/snippet}
</Story>

<Story name="Custom Fallback">
	{#snippet template()}
		<Image
			src="wrongprotocol://invalid-url.com/image.jpg"
			ratio="2/3"
			width={150}
			rounded
			skeleton={false}
		>
			{#snippet fallback()}
				<div
					style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);"
				>
					<ImageOff size={32} />
					<span style="margin-top: 8px; font-size: 12px;">No Image</span>
				</div>
			{/snippet}
		</Image>
	{/snippet}
</Story>

<Story name="Object Fit">
	{#snippet template()}
		<div style="display: flex; gap: 16px;">
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">cover</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=cover"
					ratio="1/1"
					width={120}
					rounded
					objectFit="cover"
					loading="eager"
				/>
			</div>
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">contain</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=contain"
					ratio="1/1"
					width={120}
					rounded
					objectFit="contain"
					loading="eager"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Rounded vs Not Rounded">
	{#snippet template()}
		<div style="display: flex; gap: 16px;">
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">Not rounded</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=notrounded"
					ratio="2/3"
					width={120}
					loading="eager"
				/>
			</div>
			<div>
				<p style="margin-bottom: 8px; font-size: 12px;">Rounded</p>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=rounded"
					ratio="2/3"
					width={120}
					rounded
					loading="eager"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Card Context">
	{#snippet template()}
		<div style="display: flex; gap: 16px;">
			<div
				style="width: 180px; border-radius: var(--radius-xl); overflow: hidden; background: var(--bg-secondary); box-shadow: var(--shadow-md);"
			>
				<Image
					src="https://api.dicebear.com/7.x/shapes/png?seed=card"
					ratio="2/3"
					loading="eager"
				/>
				<div style="padding: 12px;">
					<p style="font-weight: 600; margin-bottom: 4px;">Movie Title</p>
					<p style="font-size: 12px; color: var(--text-secondary);">2024</p>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

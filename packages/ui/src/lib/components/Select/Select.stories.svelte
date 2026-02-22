<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Button from '../Button/Button.svelte';
	import Input from '../Input/Input.svelte';
	import Select from './Select.svelte';

	const { Story } = defineMeta({
		title: 'Components/Select',
		component: Select,
		tags: ['autodocs'],
		argTypes: {
			size: { control: 'select', options: ['sm', 'md', 'lg'] }
		}
	});

	let selectedSize = $state('md');
	let selectedCountry = $state('');
	let selectedGenre = $state('action');
	let selectedStatus = $state('');
	let selectedRole = $state('moderator');
</script>

<Story name="Playground" args={{ label: 'Choose option', size: 'md' }}>
	{#snippet template(args)}
		<div style="max-width: 400px;">
			<Select
				{...args}
				options={[
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' },
					{ value: 'option3', label: 'Option 3' }
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>sm</span
				>
				<Select
					size="sm"
					label="Size"
					options={[
						{ value: 'sm', label: 'Small' },
						{ value: 'md', label: 'Medium' },
						{ value: 'lg', label: 'Large' }
					]}
					bind:value={selectedSize}
				/>
			</div>
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>md</span
				>
				<Select
					size="md"
					label="Size"
					options={[
						{ value: 'sm', label: 'Small' },
						{ value: 'md', label: 'Medium' },
						{ value: 'lg', label: 'Large' }
					]}
					bind:value={selectedSize}
				/>
			</div>
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>lg</span
				>
				<Select
					size="lg"
					label="Size"
					options={[
						{ value: 'sm', label: 'Small' },
						{ value: 'md', label: 'Medium' },
						{ value: 'lg', label: 'Large' }
					]}
					bind:value={selectedSize}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Default">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Select
				label="Country"
				options={[
					{ value: 'us', label: 'United States' },
					{ value: 'uk', label: 'United Kingdom' },
					{ value: 'ca', label: 'Canada' },
					{ value: 'au', label: 'Australia' }
				]}
				bind:value={selectedCountry}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Filled">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Select
				label="Favorite Genre"
				options={[
					{ value: 'action', label: 'Action' },
					{ value: 'comedy', label: 'Comedy' },
					{ value: 'drama', label: 'Drama' },
					{ value: 'sci-fi', label: 'Sci-Fi' },
					{ value: 'horror', label: 'Horror' }
				]}
				bind:value={selectedGenre}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Helper">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Select
				label="Language"
				helper="Choose your preferred language for the interface"
				options={[
					{ value: 'en', label: 'English' },
					{ value: 'es', label: 'Spanish' },
					{ value: 'fr', label: 'French' },
					{ value: 'de', label: 'German' },
					{ value: 'it', label: 'Italian' }
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Empty with error</span
				>
				<Select
					label="Status"
					error="This field is required"
					options={[
						{ value: 'active', label: 'Active' },
						{ value: 'inactive', label: 'Inactive' },
						{ value: 'pending', label: 'Pending' }
					]}
					bind:value={selectedStatus}
				/>
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Filled with error</span
				>
				<Select
					label="Role"
					bind:value={selectedRole}
					error="This role is not available"
					options={[
						{ value: 'admin', label: 'Administrator' },
						{ value: 'moderator', label: 'Moderator' },
						{ value: 'user', label: 'User' }
					]}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Empty disabled</span
				>
				<Select
					label="Category"
					disabled
					options={[
						{ value: 'movies', label: 'Movies' },
						{ value: 'tv', label: 'TV Shows' },
						{ value: 'anime', label: 'Anime' }
					]}
				/>
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Filled disabled</span
				>
				<Select
					label="Category"
					value="movies"
					disabled
					options={[
						{ value: 'movies', label: 'Movies' },
						{ value: 'tv', label: 'TV Shows' },
						{ value: 'anime', label: 'Anime' }
					]}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Many Options">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Select
				label="Movie Genre"
				helper="Scroll to see all available genres"
				options={[
					{ value: 'action', label: 'Action' },
					{ value: 'adventure', label: 'Adventure' },
					{ value: 'animation', label: 'Animation' },
					{ value: 'comedy', label: 'Comedy' },
					{ value: 'crime', label: 'Crime' },
					{ value: 'documentary', label: 'Documentary' },
					{ value: 'drama', label: 'Drama' },
					{ value: 'family', label: 'Family' },
					{ value: 'fantasy', label: 'Fantasy' },
					{ value: 'history', label: 'History' },
					{ value: 'horror', label: 'Horror' },
					{ value: 'music', label: 'Music' },
					{ value: 'mystery', label: 'Mystery' },
					{ value: 'romance', label: 'Romance' },
					{ value: 'sci-fi', label: 'Science Fiction' },
					{ value: 'thriller', label: 'Thriller' },
					{ value: 'war', label: 'War' },
					{ value: 'western', label: 'Western' }
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Disabled Options">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Select
				label="Subscription Plan"
				helper="Premium plans are currently unavailable"
				options={[
					{ value: 'free', label: 'Free Plan' },
					{ value: 'basic', label: 'Basic Plan - $9.99/mo' },
					{ value: 'premium', label: 'Premium Plan - $19.99/mo', disabled: true },
					{ value: 'enterprise', label: 'Enterprise - Contact us', disabled: true }
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div
			style="max-width: 400px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-xl);"
		>
			<h2 style="margin-bottom: 24px; color: var(--text-primary);">Add Movie</h2>
			<form
				onsubmit={(e) => e.preventDefault()}
				style="display: flex; flex-direction: column; gap: 16px;"
			>
				<Input label="Movie Title" placeholder="Enter movie title" />
				<Select
					label="Genre"
					options={[
						{ value: 'action', label: 'Action' },
						{ value: 'comedy', label: 'Comedy' },
						{ value: 'drama', label: 'Drama' },
						{ value: 'sci-fi', label: 'Sci-Fi' }
					]}
				/>
				<Select
					label="Watch Status"
					helper="Mark if you've already watched this movie"
					options={[
						{ value: 'plan-to-watch', label: 'Plan to Watch' },
						{ value: 'watching', label: 'Watching' },
						{ value: 'completed', label: 'Completed' },
						{ value: 'dropped', label: 'Dropped' }
					]}
				/>
				<Button type="submit" variant="primary" style="margin-top: 8px;">Add Movie</Button>
			</form>
		</div>
	{/snippet}
</Story>

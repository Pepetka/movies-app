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

<Story
	name="Playground"
	args={{ label: 'Choose option', size: 'md', placeholder: 'Choose option' }}
>
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
		<div style="display: flex; flex-direction: column; gap: var(--space-4);">
			<div style="display: flex; align-items: center; gap: var(--space-3);">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>sm</span
				>
				<Select
					size="sm"
					label="Size"
					placeholder="Choose size"
					options={[
						{ value: 'sm', label: 'Small' },
						{ value: 'md', label: 'Medium' },
						{ value: 'lg', label: 'Large' }
					]}
					bind:value={selectedSize}
				/>
			</div>
			<div style="display: flex; align-items: center; gap: var(--space-3);">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>md</span
				>
				<Select
					size="md"
					label="Size"
					placeholder="Choose size"
					options={[
						{ value: 'sm', label: 'Small' },
						{ value: 'md', label: 'Medium' },
						{ value: 'lg', label: 'Large' }
					]}
					bind:value={selectedSize}
				/>
			</div>
			<div style="display: flex; align-items: center; gap: var(--space-3);">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>lg</span
				>
				<Select
					size="lg"
					label="Size"
					placeholder="Choose size"
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
				placeholder="Select a country"
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
				placeholder="Select language"
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
		<div style="display: flex; flex-direction: column; gap: var(--space-6); max-width: 400px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: var(--space-2); display: block;"
					>Empty with error</span
				>
				<Select
					label="Status"
					placeholder="Select status"
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
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: var(--space-2); display: block;"
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
		<div style="display: flex; flex-direction: column; gap: var(--space-6); max-width: 400px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: var(--space-2); display: block;"
					>Empty disabled</span
				>
				<Select
					label="Category"
					placeholder="Select category"
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
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: var(--space-2); display: block;"
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
				placeholder="Select a genre"
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
				placeholder="Choose a plan"
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
			style="max-width: 400px; padding: var(--space-6); background: var(--bg-secondary); border-radius: var(--radius-xl);"
		>
			<h2 style="margin-bottom: var(--space-6); color: var(--text-primary);">Add Movie</h2>
			<form
				onsubmit={(e) => e.preventDefault()}
				style="display: flex; flex-direction: column; gap: var(--space-4);"
			>
				<Input label="Movie Title" placeholder="Enter movie title" />
				<Select
					label="Genre"
					placeholder="Select genre"
					options={[
						{ value: 'action', label: 'Action' },
						{ value: 'comedy', label: 'Comedy' },
						{ value: 'drama', label: 'Drama' },
						{ value: 'sci-fi', label: 'Sci-Fi' }
					]}
				/>
				<Select
					label="Watch Status"
					placeholder="Select status"
					helper="Mark if you've already watched this movie"
					options={[
						{ value: 'plan-to-watch', label: 'Plan to Watch' },
						{ value: 'watching', label: 'Watching' },
						{ value: 'completed', label: 'Completed' },
						{ value: 'dropped', label: 'Dropped' }
					]}
				/>
				<Button type="submit" variant="primary" style="margin-top: var(--space-2);"
					>Add Movie</Button
				>
			</form>
		</div>
	{/snippet}
</Story>

<Story name="Accessibility">
	{#snippet template()}
		<div style="max-width: 400px;">
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Клавиатурная навигация</h3>

			<div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
				<Select
					label="Страна"
					placeholder="Выберите страну"
					helper="Нажмите Tab для фокуса, стрелки для навигации"
					options={[
						{ value: 'ru', label: 'Россия' },
						{ value: 'us', label: 'США' },
						{ value: 'uk', label: 'Великобритания' }
					]}
				/>
				<Select
					label="Язык"
					options={[
						{ value: 'ru', label: 'Русский' },
						{ value: 'en', label: 'Английский' }
					]}
				/>
			</div>

			<div style="padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
				<h4 style="margin: 0 0 12px; font-size: var(--text-sm); color: var(--text-secondary);">
					Доступные клавиши:
				</h4>
				<div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-sm);">
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Tab</kbd
						>
						<span style="color: var(--text-secondary);">Перемещение между списками</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Space / Enter</kbd
						>
						<span style="color: var(--text-secondary);">Открытие списка</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>↑ / ↓</kbd
						>
						<span style="color: var(--text-secondary);">Навигация по опциям</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Esc</kbd
						>
						<span style="color: var(--text-secondary);">Закрытие списка</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

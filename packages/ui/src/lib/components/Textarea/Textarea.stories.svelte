<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Button from '../Button/Button.svelte';
	import Input from '../Input/Input.svelte';
	import Textarea from './Textarea.svelte';

	const { Story } = defineMeta({
		title: 'Components/Textarea',
		component: Textarea,
		tags: ['autodocs'],
		argTypes: {
			rows: { control: 'number', min: 1, max: 10 },
			maxRows: { control: 'number', min: 1, max: 20 },
			maxLength: { control: 'number' },
			autoGrow: { control: 'boolean' }
		}
	});

	let value = $state('');
	let valueWithError = $state('');
	let valueWithHelper = $state('');
	let valueWithMaxLength = $state('');
	let disabledValue = $state('This textarea is disabled');
	let fixedHeightValue = $state('');
	let groupDescription = $state('');
	let groupName = $state('');
</script>

<Story name="Playground" args={{ label: 'Message', placeholder: 'Enter your message', rows: 3 }} />

<Story name="Default">
	{#snippet template()}
		<div style="max-width: 500px;">
			<Textarea label="Message" placeholder="Enter your message" />
		</div>
	{/snippet}
</Story>

<Story name="Filled">
	{#snippet template()}
		<div style="max-width: 500px;">
			<Textarea
				label="Description"
				value="This is a pre-filled textarea with some content that spans multiple lines to demonstrate the floating label behavior."
				placeholder="Enter description"
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Helper">
	{#snippet template()}
		<div style="max-width: 500px;">
			<Textarea
				bind:value={valueWithHelper}
				label="Bio"
				placeholder="Tell us about yourself"
				helper="Write a short bio (max 500 characters)"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 500px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Empty with error</span
				>
				<Textarea
					bind:value={valueWithError}
					label="Comment"
					placeholder="Enter your comment"
					error="This field is required"
				/>
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Filled with error</span
				>
				<Textarea
					label="Description"
					value="This content is too short and doesn't meet the requirements"
					error="Description must be at least 50 characters"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 500px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Empty disabled</span
				>
				<Textarea label="Notes" placeholder="Add your notes" disabled />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Filled disabled</span
				>
				<Textarea label="Notes" bind:value={disabledValue} disabled />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="With Max Length">
	{#snippet template()}
		<div style="max-width: 500px;">
			<Textarea
				bind:value={valueWithMaxLength}
				label="Tweet"
				placeholder="What's happening?"
				maxLength={280}
				helper="Write your message (280 characters max)"
			/>
		</div>
	{/snippet}
</Story>

<Story name="Auto Grow">
	{#snippet template()}
		<div style="max-width: 500px;">
			<span
				style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
			>
				Type to see the textarea grow automatically
			</span>
			<Textarea
				bind:value
				label="Long text"
				placeholder="Start typing... the textarea will grow as you add more content"
				autoGrow={true}
				maxRows={8}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Fixed Height">
	{#snippet template()}
		<div style="max-width: 500px;">
			<span
				style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
			>
				Manual resize enabled, auto-grow disabled
			</span>
			<Textarea
				bind:value={fixedHeightValue}
				label="Notes"
				placeholder="You can manually resize this textarea"
				rows={4}
				autoGrow={false}
			/>
		</div>
	{/snippet}
</Story>

<Story name="With Max Rows">
	{#snippet template()}
		<div style="max-width: 500px;">
			<span
				style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
			>
				Will grow up to 5 rows, then scroll
			</span>
			<Textarea
				label="Message"
				placeholder="Type a lot of text to see scrolling behavior"
				rows={2}
				maxRows={5}
				autoGrow={true}
			/>
		</div>
	{/snippet}
</Story>

<Story name="Different Rows">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 500px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>2 rows</span
				>
				<Textarea label="Short message" rows={2} placeholder="Enter a short message" />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>5 rows</span
				>
				<Textarea label="Long message" rows={5} placeholder="Enter a longer message" />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>8 rows</span
				>
				<Textarea label="Essay" rows={8} placeholder="Write your essay here" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div
			style="max-width: 450px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-xl);"
		>
			<h2 style="margin-bottom: 8px; color: var(--text-primary);">Create Group</h2>
			<p style="margin-bottom: 24px; color: var(--text-tertiary); font-size: var(--text-sm);">
				Start by creating a new group for your movie collection
			</p>
			<form
				onsubmit={(e) => e.preventDefault()}
				style="display: flex; flex-direction: column; gap: 16px;"
			>
				<Input bind:value={groupName} label="Group Name" placeholder="My Movie Collection" />
				<Textarea
					bind:value={groupDescription}
					label="Description"
					placeholder="What is this group about?"
					rows={3}
					helper="Optional: add a description for your group members"
				/>
				<Button type="submit" variant="primary" style="margin-top: 8px;">Create Group</Button>
			</form>
		</div>
	{/snippet}
</Story>

<Story name="Validation States">
	{#snippet template()}
		<div style="max-width: 500px;">
			<div style="margin-bottom: 24px;">
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
				>
					Before submission
				</span>
				<Textarea
					label="Feedback"
					placeholder="Share your thoughts with us"
					helper="Your feedback helps us improve"
					maxLength={500}
				/>
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
				>
					With validation error
				</span>
				<Textarea
					label="Feedback"
					value="Too short"
					error="Feedback must be at least 20 characters"
					maxLength={500}
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Contact Form">
	{#snippet template()}
		<div
			style="max-width: 450px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-xl);"
		>
			<h2 style="margin-bottom: 8px; color: var(--text-primary);">Contact Us</h2>
			<p style="margin-bottom: 24px; color: var(--text-tertiary); font-size: var(--text-sm);">
				Have a question or feedback? We'd love to hear from you.
			</p>
			<form
				onsubmit={(e) => e.preventDefault()}
				style="display: flex; flex-direction: column; gap: 16px;"
			>
				<Input label="Name" type="text" placeholder="Your name" />
				<Input label="Email" type="email" placeholder="your@email.com" />
				<Textarea
					label="Message"
					placeholder="How can we help you?"
					rows={5}
					maxLength={1000}
					helper="Be as detailed as possible"
				/>
				<Button type="submit" variant="primary" style="margin-top: 8px;">Send Message</Button>
			</form>
		</div>
	{/snippet}
</Story>

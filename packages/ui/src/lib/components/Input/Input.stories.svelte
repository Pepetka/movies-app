<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Search, Eye, EyeOff, X } from '@lucide/svelte';

	import Textarea from '../Textarea/Textarea.svelte';
	import Button from '../Button/Button.svelte';
	import Select from '../Select/Select.svelte';
	import Switch from '../Switch/Switch.svelte';
	import Input from './Input.svelte';

	const { Story } = defineMeta({
		title: 'Components/Input',
		component: Input,
		tags: ['autodocs'],
		argTypes: {
			type: { control: 'select', options: ['text', 'email', 'password', 'number'] },
			size: { control: 'select', options: ['sm', 'md', 'lg'] }
		}
	});

	let searchValue = $state('');
	let passwordValue = $state('');
	let showPassword = $state(false);
	let clearableValue = $state('');
</script>

<Story name="Playground" args={{ label: 'Email', placeholder: 'Enter your email', size: 'md' }} />

<Story name="All Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px;">
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>sm</span
				>
				<Input size="sm" label="Name" />
			</div>
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>md</span
				>
				<Input size="md" label="Name" />
			</div>
			<div style="display: flex; align-items: center; gap: 12px;">
				<span style="font-size: var(--text-sm); color: var(--text-tertiary); min-width: 40px;"
					>lg</span
				>
				<Input size="lg" label="Name" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Default">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Input label="Email" placeholder="Enter your email" />
		</div>
	{/snippet}
</Story>

<Story name="Filled">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Input label="Email" value="john@example.com" placeholder="Enter your email" />
		</div>
	{/snippet}
</Story>

<Story name="With Helper">
	{#snippet template()}
		<div style="max-width: 400px;">
			<Input
				label="Username"
				placeholder="Choose a username"
				helper="Must be at least 3 characters long"
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
				<Input label="Email" placeholder="Enter your email" error="This field is required" />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Filled with error</span
				>
				<Input
					label="Email"
					value="invalid-email"
					placeholder="Enter your email"
					error="Please enter a valid email address"
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
				<Input label="Email" placeholder="Enter your email" disabled />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Filled disabled</span
				>
				<Input label="Email" value="john@example.com" disabled />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="With Icon">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Search</span
				>
				<Input
					bind:value={searchValue}
					label="Search"
					placeholder="Search movies..."
					Icon={Search}
					iconAction={() => {}}
					iconLabel="Search"
				/>
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Password toggle</span
				>
				<Input
					bind:value={passwordValue}
					type={showPassword ? 'text' : 'password'}
					label="Password"
					placeholder="Enter your password"
					Icon={showPassword ? EyeOff : Eye}
					iconAction={() => (showPassword = !showPassword)}
					iconLabel={showPassword ? 'Hide password' : 'Show password'}
				/>
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Clearable</span
				>
				<Input
					bind:value={clearableValue}
					label="Tags"
					placeholder="Enter tags"
					Icon={X}
					iconAction={() => (clearableValue = '')}
					iconLabel="Clear"
				/>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Input Types">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Text</span
				>
				<Input type="text" label="Full Name" placeholder="John Doe" />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Email</span
				>
				<Input type="email" label="Email" placeholder="john@example.com" />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Password</span
				>
				<Input type="password" label="Password" placeholder="Enter password" />
			</div>
			<div>
				<span
					style="font-size: var(--text-sm); color: var(--text-tertiary); margin-bottom: 8px; display: block;"
					>Number</span
				>
				<Input type="number" label="Age" placeholder="25" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="In Context">
	{#snippet template()}
		<div
			style="max-width: 400px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-xl);"
		>
			<h2 style="margin-bottom: 24px; color: var(--text-primary);">Sign In</h2>
			<form
				onsubmit={(e) => e.preventDefault()}
				style="display: flex; flex-direction: column; gap: 16px;"
			>
				<Input type="email" label="Email" placeholder="john@example.com" />
				<Input type="password" label="Password" placeholder="Enter your password" />
				<Button type="submit" variant="primary" style="margin-top: 8px;">Sign In</Button>
			</form>
		</div>
	{/snippet}
</Story>

<Story name="Form Validation">
	{#snippet template()}
		<div
			style="max-width: 400px; padding: 24px; background: var(--bg-secondary); border-radius: var(--radius-xl);"
		>
			<h2 style="margin-bottom: 24px; color: var(--text-primary);">Create Account</h2>
			<form
				onsubmit={(e) => e.preventDefault()}
				style="display: flex; flex-direction: column; gap: 16px;"
			>
				<Input label="Full Name" placeholder="John Doe" error="Name is required" />
				<Input
					type="email"
					label="Email"
					placeholder="john@example.com"
					error="Please enter a valid email"
				/>
				<Input
					type="password"
					label="Password"
					placeholder="At least 8 characters"
					error="Password must be at least 8 characters"
					helper="Use a strong password with letters, numbers and symbols"
				/>
				<Button type="submit" variant="primary" disabled style="margin-top: 8px;">
					Create Account
				</Button>
			</form>
		</div>
	{/snippet}
</Story>

<Story name="Full Form Example">
	{#snippet template()}
		<div
			style="max-width: 500px; padding: 32px; background: var(--bg-secondary); border-radius: var(--radius-xl);"
		>
			<div style="margin-bottom: 24px;">
				<h2 style="margin: 0 0 8px 0; font-size: 24px; color: var(--text-primary);">
					Create Profile
				</h2>
				<p style="margin: 0; color: var(--text-tertiary);">Fill in your information</p>
			</div>

			<form
				onsubmit={(e) => e.preventDefault()}
				style="display: flex; flex-direction: column; gap: 20px;"
			>
				<Input
					type="text"
					label="Full Name"
					placeholder="John Doe"
					helper="Enter your full name as it appears on your ID"
				/>

				<Input
					type="email"
					label="Email Address"
					placeholder="john@example.com"
					helper="We'll send verification email to this address"
				/>

				<Select
					label="Country"
					placeholder="Select your country"
					options={[
						{ value: 'us', label: 'United States' },
						{ value: 'uk', label: 'United Kingdom' },
						{ value: 'de', label: 'Germany' },
						{ value: 'fr', label: 'France' },
						{ value: 'ru', label: 'Russia' }
					]}
				/>

				<Select
					label="Timezone"
					placeholder="Select your timezone"
					options={[
						{ value: 'utc-5', label: 'UTC-5 (Eastern Time)' },
						{ value: 'utc+0', label: 'UTC+0 (GMT)' },
						{ value: 'utc+3', label: 'UTC+3 (Moscow)' },
						{ value: 'utc+9', label: 'UTC+9 (Tokyo)' }
					]}
				/>

				<Textarea
					label="Bio"
					placeholder="Tell us about yourself..."
					helper="Maximum 500 characters"
				/>

				<div style="display: flex; flex-direction: column; gap: 12px;">
					<Switch
						label="Email notifications"
						helper="Receive updates about your activity via email"
						checked={true}
					/>
					<Switch label="Public profile" helper="Allow others to see your profile" />
					<Switch size="sm" label="Marketing emails" helper="Receive promotional offers and news" />
				</div>

				<div style="display: flex; gap: 12px; margin-top: 8px;">
					<Button type="submit" variant="primary" style="flex: 1;">Create Profile</Button>
					<Button type="button" variant="secondary">Cancel</Button>
				</div>
			</form>
		</div>
	{/snippet}
</Story>

<Story name="Accessibility">
	{#snippet template()}
		<div style="max-width: 400px;">
			<h3 style="margin-bottom: 16px; color: var(--text-secondary);">Клавиатурная навигация</h3>

			<div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
				<Input label="Имя пользователя" placeholder="Введите имя" helper="Нажмите Tab для фокуса" />
				<Input type="email" label="Email" placeholder="example@mail.com" />
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
						<span style="color: var(--text-secondary);">Перемещение между полями ввода</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Shift+Tab</kbd
						>
						<span style="color: var(--text-secondary);">Перемещение назад</span>
					</div>
					<div style="display: flex; gap: 12px;">
						<kbd
							style="padding: 2px 8px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-family: monospace;"
							>Enter</kbd
						>
						<span style="color: var(--text-secondary);">Отправка формы (если в форме)</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

import type { HealthStatus, HealthCheckResult } from '$lib/types/health';
import { healthConfig } from '$lib/config/health.config';
import { checkHealth } from '$lib/api/health';
import { logger } from '$lib/utils/logger';

class HealthStore {
	status = $state<HealthStatus>('loading');
	lastChecked = $state<Date | undefined>();
	latency = $state<number | undefined>();
	error = $state<string | undefined>();

	private _intervalId: ReturnType<typeof setTimeout> | null = null;
	private _currentInterval: number = healthConfig.defaultPollingInterval;
	private _abortController: AbortController | null = null;
	private _consecutiveFailures: number = 0;
	private _isTabVisible: boolean = $state(true);
	private _visibilityHandler: (() => void) | null = null;

	constructor() {
		if (typeof window !== 'undefined' && typeof document !== 'undefined') {
			this._visibilityHandler = () => {
				this._isTabVisible = !document.hidden;

				if (this._isTabVisible && !this._intervalId) {
					void this._executeHealthCheck();
					this._scheduleNextCheck();
				} else if (!this._isTabVisible && this._intervalId) {
					this._clearScheduledCheck();
				}
			};

			document.addEventListener('visibilitychange', this._visibilityHandler);
		}

		this.log('info', 'HealthStore initialized', {
			pollingInterval: this._currentInterval,
			maxFailures: healthConfig.maxConsecutiveFailures
		});
	}

	async check() {
		return this._executeHealthCheck();
	}

	private async _executeHealthCheck(): Promise<HealthCheckResult> {
		this.log('debug', 'Starting health check execution');

		if (this._abortController) {
			this._abortController.abort();
		}

		this._abortController = new AbortController();
		this.status = 'loading';

		try {
			const result = await checkHealth();

			switch (result.type) {
				case 'success':
					this._handleSuccessfulCheck(result);
					return result;
				case 'degraded':
					this._handleDegradedCheck(result);
					return result;
				case 'error':
					this._handleFailedCheck(new Error(result.error));
					return result;
			}
		} catch (error) {
			const networkError = error instanceof Error ? error : new Error(String(error));
			this._handleFailedCheck(networkError);
			throw error;
		} finally {
			this._abortController = null;
		}
	}

	private _handleSuccessfulCheck(result: HealthCheckResult & { type: 'success' }): void {
		this.status = 'online';
		this.latency = result.latency;
		this.lastChecked = result.timestamp;
		this.error = undefined;
		this._currentInterval = healthConfig.defaultPollingInterval;
		this._consecutiveFailures = 0;

		this.log('info', 'Health check successful', {
			latency: result.latency,
			database: result.database
		});

		this._updatePollingInterval(true);
	}

	private _handleDegradedCheck(result: HealthCheckResult & { type: 'degraded' }): void {
		this.status = 'degraded';
		this.latency = result.latency;
		this.lastChecked = result.timestamp;
		this.error = result.error;
		this._currentInterval = healthConfig.defaultPollingInterval;
		this._consecutiveFailures = 0;

		this.log('warn', 'Health check degraded', {
			latency: result.latency,
			database: result.database,
			error: result.error
		});

		this._updatePollingInterval(true);
	}

	private _handleFailedCheck(error: Error): void {
		this.status = 'offline';
		this.error = error.message;
		this._consecutiveFailures++;

		this.log('error', 'Health check failed', {
			error: error.message,
			consecutiveFailures: this._consecutiveFailures
		});

		if (this._consecutiveFailures >= healthConfig.maxConsecutiveFailures) {
			this.log('warn', 'Max consecutive failures reached, stopping polling', {
				failures: this._consecutiveFailures,
				maxFailures: healthConfig.maxConsecutiveFailures
			});
			this._clearScheduledCheck();
		} else {
			this._updatePollingInterval(false);
		}
	}

	private _updatePollingInterval(success: boolean): void {
		if (success) {
			this._currentInterval = healthConfig.defaultPollingInterval;
			this._consecutiveFailures = 0;
		} else {
			const newInterval = this._currentInterval * healthConfig.backoffMultiplier;
			this._currentInterval = Math.min(newInterval, healthConfig.maxBackoffInterval);

			this.log('debug', 'Updated polling interval with backoff', {
				oldInterval: this._currentInterval / healthConfig.backoffMultiplier,
				newInterval: this._currentInterval,
				maxInterval: healthConfig.maxBackoffInterval
			});
		}

		if (this._intervalId) {
			this._scheduleNextCheck();
		}
	}

	private _scheduleNextCheck(): void {
		this._clearScheduledCheck();

		if (!this._isTabVisible) {
			this.log('debug', 'Tab not visible, skipping schedule');
			return;
		}

		this._intervalId = setTimeout(() => {
			void this._executeHealthCheck();
			this._scheduleNextCheck();
		}, this._currentInterval);

		this.log('debug', 'Scheduled next health check', {
			interval: this._currentInterval,
			nextCheckIn: `${this._currentInterval}ms`
		});
	}

	private _clearScheduledCheck(): void {
		if (this._intervalId) {
			clearTimeout(this._intervalId);
			this._intervalId = null;
		}
	}

	startPolling() {
		if (!this._isTabVisible) {
			this.log('debug', 'Tab not visible, skipping polling start');
			return;
		}

		this.log('info', 'Starting health check polling');
		void this._executeHealthCheck();
		this._scheduleNextCheck();
	}

	stopPolling() {
		this.log('info', 'Stopping health check polling');
		this._clearScheduledCheck();

		if (this._abortController) {
			try {
				this._abortController.abort();
			} catch (error) {
				this.log('warn', 'Error aborting request', { error: String(error) });
			}
			this._abortController = null;
		}
	}

	destroy(): void {
		this.log('debug', 'Starting HealthStore cleanup');

		// 1. Остановить polling
		this._clearScheduledCheck();

		// 2. Отменить текущий запрос
		if (this._abortController) {
			try {
				this._abortController.abort();
			} catch (error) {
				this.log('warn', 'Error aborting request', { error: String(error) });
			}
			this._abortController = null;
		}

		// 3. Удалить обработчик видимости
		if (this._visibilityHandler && typeof document !== 'undefined') {
			try {
				document.removeEventListener('visibilitychange', this._visibilityHandler);
			} catch (error) {
				this.log('warn', 'Error removing visibility listener', { error: String(error) });
			}
			this._visibilityHandler = null;
		}

		// 4. Сбросить состояние
		this._consecutiveFailures = 0;
		this._currentInterval = healthConfig.defaultPollingInterval;

		this.log('info', 'HealthStore destroyed successfully');
	}

	private log(
		level: 'debug' | 'info' | 'warn' | 'error',
		message: string,
		meta?: Record<string, unknown>
	): void {
		logger[level]('HealthStore', message, meta);
	}
}

export const healthStore = new HealthStore();

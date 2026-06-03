import type { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import type { Provider, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';

export interface TestModuleOverride {
  apply(builder: TestingModuleBuilder): void;
}

export interface CreateTestModuleConfig {
  providers: Array<Type<unknown> | Provider>;
  overrides?: TestModuleOverride[];
}

export async function createTestModule(
  options: CreateTestModuleConfig,
): Promise<TestingModule> {
  const { providers, overrides } = options;

  const builder = Test.createTestingModule({
    providers,
  });

  for (const o of overrides ?? []) {
    o.apply(builder);
  }

  return builder.compile();
}

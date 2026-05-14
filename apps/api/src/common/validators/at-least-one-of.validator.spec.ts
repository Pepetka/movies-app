import { ValidationArguments } from 'class-validator';

import {
  AtLeastOneOfConstraint,
  AtLeastOneOfClass,
} from './at-least-one-of.validator';

describe('AtLeastOneOfConstraint', () => {
  const constraint = new AtLeastOneOfConstraint();

  it('should return true when at least one property is provided', () => {
    const result = constraint.validate(undefined, {
      object: { rating: 4.5, text: undefined },
      constraints: [['rating', 'text']],
      property: '',
      targetName: 'TestDto',
    } as ValidationArguments);

    expect(result).toBe(true);
  });

  it('should return true when text is provided and rating is undefined', () => {
    const result = constraint.validate(undefined, {
      object: { rating: undefined, text: 'Good movie' },
      constraints: [['rating', 'text']],
      property: '',
      targetName: 'TestDto',
    } as ValidationArguments);

    expect(result).toBe(true);
  });

  it('should return false when all properties are undefined', () => {
    const result = constraint.validate(undefined, {
      object: { rating: undefined, text: undefined },
      constraints: [['rating', 'text']],
      property: '',
      targetName: 'TestDto',
    } as ValidationArguments);

    expect(result).toBe(false);
  });

  it('should return false when all properties are null', () => {
    const result = constraint.validate(undefined, {
      object: { rating: null, text: null },
      constraints: [['rating', 'text']],
      property: '',
      targetName: 'TestDto',
    } as ValidationArguments);

    expect(result).toBe(false);
  });

  it('should return false when all properties are empty strings', () => {
    const result = constraint.validate(undefined, {
      object: { rating: '', text: '' },
      constraints: [['rating', 'text']],
      property: '',
      targetName: 'TestDto',
    } as ValidationArguments);

    expect(result).toBe(false);
  });

  it('should generate correct default message', () => {
    const message = constraint.defaultMessage({
      constraints: [['rating', 'text']],
      property: '',
      targetName: 'TestDto',
      object: {},
      value: undefined,
    } as ValidationArguments);

    expect(message).toBe('At least one of rating, text must be provided');
  });
});

describe('AtLeastOneOfClass', () => {
  it('should register decorator without errors', () => {
    @AtLeastOneOfClass(['rating', 'text'])
    class TestDto {
      rating?: number;
      text?: string;
    }

    expect(TestDto).toBeDefined();
  });
});

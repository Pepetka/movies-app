import { IsValidReviewRatingConstraint } from './is-valid-review-rating.validator';

describe('IsValidReviewRatingConstraint', () => {
  const constraint = new IsValidReviewRatingConstraint();

  it.each([
    [0.5, true],
    [1.0, true],
    [1.5, true],
    [2.0, true],
    [2.5, true],
    [3.0, true],
    [3.5, true],
    [4.0, true],
    [4.5, true],
    [5.0, true],
  ])('should validate %s as %s', (value, expected) => {
    expect(constraint.validate(value)).toBe(expected);
  });

  it.each([
    [0, false],
    [0.4, false],
    [5.1, false],
    [1.2, false],
    [2.3, false],
    [3.7, false],
    [4.9, false],
    [-1, false],
    [NaN, false],
    [Infinity, false],
    ['4.5', false],
    [null, false],
    [undefined, false],
  ])('should invalidate %s', (value, expected) => {
    expect(constraint.validate(value)).toBe(expected);
  });

  it('should return correct default message', () => {
    expect(constraint.defaultMessage()).toBe(
      'Rating must be between 0.5 and 5.0 with a step of 0.5',
    );
  });
});

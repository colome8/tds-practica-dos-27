import { describe, expect, test } from '@jest/globals';
import { validateExtensionEndTime } from '../reservation.rules';

describe('validateExtensionEndTime', () => {
  const now = new Date('2026-11-02T10:00:00.000Z');
  const currentEnd = new Date('2026-11-02T11:00:00.000Z');

  test('returns the new end time for a valid extension', () => {
    // Arrange
    const newEndTime = '2026-11-02T12:00:00.000Z';

    // Act
    const result = validateExtensionEndTime(currentEnd, newEndTime, now);

    // Assert
    expect(result).toEqual(new Date(newEndTime));
  });

  test('returns null when the new end time is invalid', () => {
    const result = validateExtensionEndTime(currentEnd, 'invalid-date', now);

    expect(result).toBeNull();
  });

  test('returns null when the new end time is not a string', () => {
    const result = validateExtensionEndTime(currentEnd, null, now);

    expect(result).toBeNull();
  });

  test('returns null when the new end time equals the current end time', () => {
    const result = validateExtensionEndTime(
      currentEnd,
      '2026-11-02T11:00:00.000Z',
      now
    );

    expect(result).toBeNull();
  });

  test('returns null when the new end time is before the current end time', () => {
    const result = validateExtensionEndTime(
      currentEnd,
      '2026-11-02T10:30:00.000Z',
      now
    );

    expect(result).toBeNull();
  });

  test('returns null when the reservation has already ended', () => {
    const finishedEnd = new Date('2026-11-02T09:00:00.000Z');

    const result = validateExtensionEndTime(
      finishedEnd,
      '2026-11-02T12:00:00.000Z',
      now
    );

    expect(result).toBeNull();
  });

  test('returns null when the reservation ends exactly now', () => {
    const result = validateExtensionEndTime(
      now,
      '2026-11-02T12:00:00.000Z',
      now
    );

    expect(result).toBeNull();
  });
});
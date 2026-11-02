import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test
} from '@jest/globals';
import { Types } from 'mongoose';
import { Reservation } from '../reservation.model';
import { extendReservation } from '../reservation.service';

jest.mock('../reservation.model', () => ({
  Reservation: {
    findById: jest.fn(),
    exists: jest.fn()
  }
}));

type MockReservation = {
  _id: Types.ObjectId;
  parkingSpotId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: string;
  save: jest.Mock<() => Promise<void>>;
};

const findByIdMock = Reservation.findById as unknown as jest.Mock<
  (id: string) => Promise<MockReservation | null>
>;

const existsMock = Reservation.exists as unknown as jest.Mock<
  (filter: unknown) => Promise<{ _id: Types.ObjectId } | null>
>;

const now = new Date('2026-11-02T10:00:00.000Z');

function makeReservation(
  overrides: Partial<MockReservation> = {}
): MockReservation {
  return {
    _id: new Types.ObjectId('690000000000000000000001'),
    parkingSpotId: new Types.ObjectId('690000000000000000000002'),
    startTime: new Date('2026-11-02T10:00:00.000Z'),
    endTime: new Date('2026-11-02T11:00:00.000Z'),
    status: 'ACTIVE',
    save: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    ...overrides
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(now);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('extendReservation', () => {
  test('updates and saves a valid extension', async () => {
    // Arrange
    const reservation = makeReservation();
    const originalEnd = reservation.endTime;
    const newEndTime = '2026-11-02T12:00:00.000Z';

    findByIdMock.mockResolvedValue(reservation);
    existsMock.mockResolvedValue(null);

    // Act
    const result = await extendReservation(
      reservation._id.toString(),
      newEndTime
    );

    // Assert
    expect(result).toBe(reservation);
    expect(reservation.endTime).toEqual(new Date(newEndTime));
    expect(reservation.save).toHaveBeenCalledTimes(1);

    expect(existsMock).toHaveBeenCalledWith({
      _id: { $ne: reservation._id },
      parkingSpotId: reservation.parkingSpotId,
      status: 'ACTIVE',
      startTime: { $lt: new Date(newEndTime) },
      endTime: { $gt: originalEnd }
    });
  });

  test('returns 404 for an invalid reservation ID', async () => {
    await expect(
      extendReservation('invalid-id', '2026-11-02T12:00:00.000Z')
    ).rejects.toMatchObject({
      status: 404
    });

    expect(findByIdMock).not.toHaveBeenCalled();
  });

  test('returns 404 when the reservation does not exist', async () => {
    findByIdMock.mockResolvedValue(null);

    await expect(
      extendReservation(
        '690000000000000000000001',
        '2026-11-02T12:00:00.000Z'
      )
    ).rejects.toMatchObject({
      status: 404
    });
  });

  test('returns 409 for a cancelled reservation', async () => {
    const reservation = makeReservation({ status: 'CANCELLED' });
    findByIdMock.mockResolvedValue(reservation);

    await expect(
      extendReservation(
        reservation._id.toString(),
        '2026-11-02T12:00:00.000Z'
      )
    ).rejects.toMatchObject({
      status: 409
    });

    expect(reservation.save).not.toHaveBeenCalled();
  });

  test('returns 409 for a finished reservation', async () => {
    const reservation = makeReservation({
      endTime: new Date('2026-11-02T09:00:00.000Z')
    });
    findByIdMock.mockResolvedValue(reservation);

    await expect(
      extendReservation(
        reservation._id.toString(),
        '2026-11-02T12:00:00.000Z'
      )
    ).rejects.toMatchObject({
      status: 409
    });

    expect(reservation.save).not.toHaveBeenCalled();
  });

  test('returns 400 for an invalid new end time', async () => {
    const reservation = makeReservation();
    findByIdMock.mockResolvedValue(reservation);

    await expect(
      extendReservation(reservation._id.toString(), 'invalid-date')
    ).rejects.toMatchObject({
      status: 400
    });

    expect(reservation.save).not.toHaveBeenCalled();
  });

  test('returns 409 and does not save when there is a conflict', async () => {
    const reservation = makeReservation();
    findByIdMock.mockResolvedValue(reservation);
    existsMock.mockResolvedValue({ _id: new Types.ObjectId() });

    await expect(
      extendReservation(
        reservation._id.toString(),
        '2026-11-02T12:00:00.000Z'
      )
    ).rejects.toMatchObject({
      status: 409
    });

    expect(reservation.save).not.toHaveBeenCalled();
  });
});

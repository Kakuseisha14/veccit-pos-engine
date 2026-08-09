import { randomUUID } from 'node:crypto';

export interface CreateExchangeRateInput {
  tenantId: string;
  rateVES: number;
  date: string;
}

export class ExchangeRate {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly rateVES: number,
    public readonly date: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: CreateExchangeRateInput): ExchangeRate {
    const now = new Date();
    return new ExchangeRate(
      randomUUID(),
      input.tenantId,
      input.rateVES,
      input.date,
      now,
      now,
    );
  }
}

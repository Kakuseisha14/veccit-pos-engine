import { randomUUID } from 'node:crypto';

export interface CreateCustomerInput {
  tenantId: string;
  identification: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export class Customer {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly identification: string,
    public readonly name: string,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly address: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: CreateCustomerInput): Customer {
    const now = new Date();
    return new Customer(
      randomUUID(),
      input.tenantId,
      input.identification.trim().toUpperCase(),
      input.name.trim(),
      input.email?.trim().toLowerCase() || null,
      input.phone?.trim() || null,
      input.address?.trim() || null,
      now,
      now,
    );
  }
}

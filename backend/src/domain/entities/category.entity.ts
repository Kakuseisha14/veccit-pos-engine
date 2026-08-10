import { randomUUID } from 'node:crypto';

export interface CreateCategoryInput {
  tenantId: string;
  name: string;
}

export class Category {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: CreateCategoryInput): Category {
    const now = new Date();
    return new Category(
      randomUUID(),
      input.tenantId,
      input.name.trim(),
      now,
      now,
    );
  }
}

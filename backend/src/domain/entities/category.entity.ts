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
    public readonly isActive: boolean = true,
  ) {}

  static create(input: CreateCategoryInput): Category {
    const now = new Date();
    return new Category(
      randomUUID(),
      input.tenantId,
      input.name.trim(),
      now,
      now,
      true,
    );
  }

  rename(name: string): Category {
    return new Category(
      this.id,
      this.tenantId,
      name.trim(),
      this.createdAt,
      new Date(),
      this.isActive,
    );
  }

  setActive(isActive: boolean): Category {
    return new Category(
      this.id,
      this.tenantId,
      this.name,
      this.createdAt,
      new Date(),
      isActive,
    );
  }
}

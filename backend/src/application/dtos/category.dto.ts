export interface CategoryOutput {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  tenantId: string;
  name: string;
}

export interface CreateCategoryOutput {
  category: CategoryOutput;
}

export interface ListCategoriesOutput {
  categories: CategoryOutput[];
}

export interface UpdateCategoryInput {
  tenantId: string;
  categoryId: string;
  name?: string;
  isActive?: boolean;
}

export interface UpdateCategoryOutput {
  category: CategoryOutput;
}

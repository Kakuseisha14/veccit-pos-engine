export interface CategoryOutput {
  id: string;
  name: string;
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

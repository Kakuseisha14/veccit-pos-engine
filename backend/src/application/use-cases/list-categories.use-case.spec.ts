import { ListCategoriesUseCase } from './list-categories.use-case';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';

describe('ListCategoriesUseCase', () => {
  let useCase: ListCategoriesUseCase;
  const categoryRepository: jest.Mocked<ICategoryRepository> = {
    findById: jest.fn(),
    findByName: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };

  const tenantId = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListCategoriesUseCase(categoryRepository);
  });

  it('retorna las categorias ordenadas por nombre', async () => {
    const categories: Category[] = [
      new Category('c1', tenantId, 'Bebidas', new Date(), new Date(), true),
      new Category('c2', tenantId, 'Alimentos', new Date(), new Date(), true),
    ];
    categoryRepository.listByTenant.mockResolvedValue(categories);

    const result = await useCase.execute(tenantId);

    expect(result.categories.map((c) => c.name)).toEqual([
      'Alimentos',
      'Bebidas',
    ]);
    expect(categoryRepository.listByTenant).toHaveBeenCalledWith(tenantId);
  });

  it('retorna lista vacia si no hay categorias', async () => {
    categoryRepository.listByTenant.mockResolvedValue([]);

    const result = await useCase.execute(tenantId);

    expect(result.categories).toEqual([]);
  });
});

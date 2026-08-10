import { CreateCategoryUseCase } from './create-category.use-case';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import type { Category } from '../../domain/entities/category.entity';
import { CategoryAlreadyExistsException } from '../../domain/exceptions/category-already-exists.exception';
import { InvalidCategoryNameException } from '../../domain/exceptions/invalid-category-name.exception';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  const categoryRepository: jest.Mocked<ICategoryRepository> = {
    findById: jest.fn(),
    findByName: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };

  const tenantId = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateCategoryUseCase(categoryRepository);
  });

  it('crea una categoria dentro del tenant', async () => {
    categoryRepository.findByName.mockResolvedValue(null);

    const result = await useCase.execute({ tenantId, name: '  Bebidas  ' });

    expect(categoryRepository.save).toHaveBeenCalledTimes(1);
    expect(result.category.name).toBe('Bebidas');
  });

  it('lanza CategoryAlreadyExistsException si el nombre ya existe', async () => {
    const existing: Category = {
      id: 'cat-1',
      tenantId,
      name: 'Bebidas',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    categoryRepository.findByName.mockResolvedValue(existing);

    await expect(
      useCase.execute({ tenantId, name: 'Bebidas' }),
    ).rejects.toThrow(CategoryAlreadyExistsException);
    expect(categoryRepository.save).not.toHaveBeenCalled();
  });

  it('lanza InvalidCategoryNameException si el nombre esta vacio', async () => {
    await expect(useCase.execute({ tenantId, name: '   ' })).rejects.toThrow(
      InvalidCategoryNameException,
    );
    expect(categoryRepository.save).not.toHaveBeenCalled();
  });
});

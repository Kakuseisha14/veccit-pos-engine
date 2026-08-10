import { UpdateCategoryUseCase } from './update-category.use-case';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';
import { CategoryNotFoundException } from '../../domain/exceptions/category-not-found.exception';
import { CategoryAlreadyExistsException } from '../../domain/exceptions/category-already-exists.exception';
import { InvalidCategoryNameException } from '../../domain/exceptions/invalid-category-name.exception';
import { InvalidCategoryDataException } from '../../domain/exceptions/invalid-category-data.exception';

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
  const categoryRepository: jest.Mocked<ICategoryRepository> = {
    findById: jest.fn(),
    findByName: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };

  const tenantId = 'tenant-1';

  const buildCategory = (overrides: Partial<Category> = {}): Category =>
    new Category(
      overrides.id ?? 'cat-1',
      overrides.tenantId ?? tenantId,
      overrides.name ?? 'Bebidas',
      overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
      overrides.updatedAt ?? new Date('2024-01-01T00:00:00Z'),
      overrides.isActive ?? true,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateCategoryUseCase(categoryRepository);
  });

  it('renombra una categoria dentro del tenant', async () => {
    categoryRepository.findById.mockResolvedValue(buildCategory());
    categoryRepository.findByName.mockResolvedValue(null);

    const result = await useCase.execute({
      tenantId,
      categoryId: 'cat-1',
      name: '  Bebidas y Jugos  ',
    });

    expect(categoryRepository.findById).toHaveBeenCalledWith(tenantId, 'cat-1');
    expect(categoryRepository.save).toHaveBeenCalledTimes(1);
    expect(result.category.name).toBe('Bebidas y Jugos');
    expect(result.category.isActive).toBe(true);
  });

  it('inactiva una categoria', async () => {
    categoryRepository.findById.mockResolvedValue(buildCategory());

    const result = await useCase.execute({
      tenantId,
      categoryId: 'cat-1',
      isActive: false,
    });

    expect(result.category.isActive).toBe(false);
  });

  it('reactiva una categoria', async () => {
    categoryRepository.findById.mockResolvedValue(
      buildCategory({ isActive: false }),
    );

    const result = await useCase.execute({
      tenantId,
      categoryId: 'cat-1',
      isActive: true,
    });

    expect(result.category.isActive).toBe(true);
  });

  it('lanza CategoryNotFoundException si la categoria no pertenece al tenant', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ tenantId, categoryId: 'desconocida', name: 'X' }),
    ).rejects.toThrow(CategoryNotFoundException);
    expect(categoryRepository.save).not.toHaveBeenCalled();
  });

  it('lanza CategoryAlreadyExistsException si el nuevo nombre lo usa otra categoria', async () => {
    categoryRepository.findById.mockResolvedValue(buildCategory());
    categoryRepository.findByName.mockResolvedValue(
      buildCategory({ id: 'cat-2', name: 'Bebidas y Jugos' }),
    );

    await expect(
      useCase.execute({
        tenantId,
        categoryId: 'cat-1',
        name: 'Bebidas y Jugos',
      }),
    ).rejects.toThrow(CategoryAlreadyExistsException);
    expect(categoryRepository.save).not.toHaveBeenCalled();
  });

  it('lanza InvalidCategoryNameException si el nombre queda vacio', async () => {
    categoryRepository.findById.mockResolvedValue(buildCategory());

    await expect(
      useCase.execute({ tenantId, categoryId: 'cat-1', name: '   ' }),
    ).rejects.toThrow(InvalidCategoryNameException);
    expect(categoryRepository.save).not.toHaveBeenCalled();
  });

  it('lanza InvalidCategoryDataException si no llega ningun campo', async () => {
    await expect(
      useCase.execute({ tenantId, categoryId: 'cat-1' }),
    ).rejects.toThrow(InvalidCategoryDataException);
    expect(categoryRepository.save).not.toHaveBeenCalled();
  });
});

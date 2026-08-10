import { Module } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../../application/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from '../../../application/use-cases/update-category.use-case';
import { ListCategoriesUseCase } from '../../../application/use-cases/list-categories.use-case';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { AdjustStockUseCase } from '../../../application/use-cases/adjust-stock.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import { GetLowStockAlertsUseCase } from '../../../application/use-cases/get-low-stock-alerts.use-case';
import { ProductsController } from '../controllers/products.controller';
import { CategoriesController } from '../controllers/categories.controller';

@Module({
  controllers: [ProductsController, CategoriesController],
  providers: [
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    ListCategoriesUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    AdjustStockUseCase,
    ListProductsUseCase,
    GetLowStockAlertsUseCase,
  ],
})
export class InventoryModule {}

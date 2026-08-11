import { Module } from '@nestjs/common';
import { ProcessSaleUseCase } from '../../../application/use-cases/process-sale.use-case';
import { QuickRegisterCustomerUseCase } from '../../../application/use-cases/quick-register-customer.use-case';
import { ListCustomersUseCase } from '../../../application/use-cases/list-customers.use-case';
import { ListSalesUseCase } from '../../../application/use-cases/list-sales.use-case';
import { CustomersController } from '../controllers/customers.controller';
import { SalesController } from '../controllers/sales.controller';

@Module({
  controllers: [CustomersController, SalesController],
  providers: [
    ProcessSaleUseCase,
    QuickRegisterCustomerUseCase,
    ListCustomersUseCase,
    ListSalesUseCase,
  ],
})
export class SalesModule {}

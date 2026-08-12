import { Module } from '@nestjs/common';
import { GetDashboardMetricsUseCase } from '../../../application/use-cases/get-dashboard-metrics.use-case';
import { MetricsController } from '../controllers/metrics.controller';

@Module({
  controllers: [MetricsController],
  providers: [GetDashboardMetricsUseCase],
})
export class MetricsModule {}

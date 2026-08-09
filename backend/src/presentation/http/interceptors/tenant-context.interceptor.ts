import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import type { TokenPayload } from '../../../application/services/token.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      user?: TokenPayload;
    }>();

    return TenantContext.run(
      {
        tenantId: request.user?.tenantId ?? null,
        userId: request.user?.sub ?? null,
        role: request.user?.role ?? null,
      },
      () => next.handle(),
    );
  }
}

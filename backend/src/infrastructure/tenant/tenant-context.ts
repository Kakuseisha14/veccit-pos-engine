import { AsyncLocalStorage } from 'node:async_hooks';
import type { Role } from '../../domain/value-objects/role';

export interface TenantContextData {
  tenantId: string | null;
  userId: string | null;
  role: Role | null;
}

export class TenantContext {
  private static readonly storage = new AsyncLocalStorage<TenantContextData>();

  static run<T>(data: TenantContextData, callback: () => T): T {
    return this.storage.run(data, callback);
  }

  static get(): TenantContextData {
    return (
      this.storage.getStore() ?? { tenantId: null, userId: null, role: null }
    );
  }

  static getTenantId(): string | null {
    return this.storage.getStore()?.tenantId ?? null;
  }

  static getUserId(): string | null {
    return this.storage.getStore()?.userId ?? null;
  }
}

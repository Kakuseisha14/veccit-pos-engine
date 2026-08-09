import type { SessionTenant, SessionUser } from './register-tenant.dto';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  user: SessionUser;
  tenant: SessionTenant | null;
}

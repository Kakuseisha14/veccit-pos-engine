export interface CustomerOutput {
  id: string;
  identification: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
}

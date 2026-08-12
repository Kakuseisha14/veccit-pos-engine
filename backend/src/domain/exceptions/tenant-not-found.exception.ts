export class TenantNotFoundException extends Error {
  constructor(id: string) {
    super(`Comercio con id ${id} no encontrado`);
    this.name = 'TenantNotFoundException';
  }
}

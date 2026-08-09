export class TenantAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`Ya existe un comercio registrado con el correo ${email}`);
    this.name = 'TenantAlreadyExistsException';
  }
}

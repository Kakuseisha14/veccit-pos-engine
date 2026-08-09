export class InvalidRoleException extends Error {
  constructor(role: string) {
    super(`El rol ${role} no esta permitido para usuarios de un inquilino`);
    this.name = 'InvalidRoleException';
  }
}

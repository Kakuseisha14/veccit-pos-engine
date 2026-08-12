export class InvalidCredentialsException extends Error {
  constructor(message = 'Credenciales inválidas') {
    super(message);
    this.name = 'InvalidCredentialsException';
  }
}

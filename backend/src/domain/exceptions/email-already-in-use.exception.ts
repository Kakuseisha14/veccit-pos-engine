export class EmailAlreadyInUseException extends Error {
  constructor(email: string) {
    super(`El correo ${email} ya esta en uso`);
    this.name = 'EmailAlreadyInUseException';
  }
}

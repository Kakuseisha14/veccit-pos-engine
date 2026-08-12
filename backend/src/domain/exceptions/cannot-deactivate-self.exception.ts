export class CannotDeactivateSelfException extends Error {
  constructor() {
    super('No puedes desactivar tu propio usuario');
    this.name = 'CannotDeactivateSelfException';
  }
}

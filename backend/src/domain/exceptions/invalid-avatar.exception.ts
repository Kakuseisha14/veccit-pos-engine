export class InvalidAvatarException extends Error {
  constructor(detail: string) {
    super(`El avatar no es valido: ${detail}`);
    this.name = 'InvalidAvatarException';
  }
}

export class InvalidProductDataException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProductDataException';
  }
}

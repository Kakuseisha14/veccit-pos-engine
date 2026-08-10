export class InvalidCategoryDataException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCategoryDataException';
  }
}

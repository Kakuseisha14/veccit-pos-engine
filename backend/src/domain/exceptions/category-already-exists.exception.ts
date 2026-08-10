export class CategoryAlreadyExistsException extends Error {
  constructor(name: string) {
    super(`Ya existe una categoria llamada "${name}"`);
    this.name = 'CategoryAlreadyExistsException';
  }
}

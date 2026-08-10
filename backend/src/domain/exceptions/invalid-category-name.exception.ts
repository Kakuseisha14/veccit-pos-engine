export class InvalidCategoryNameException extends Error {
  constructor() {
    super('El nombre de la categoria es requerido');
    this.name = 'InvalidCategoryNameException';
  }
}

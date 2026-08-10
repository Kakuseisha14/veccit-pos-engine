export class CategoryNotFoundException extends Error {
  constructor(categoryId: string) {
    super(`La categoria ${categoryId} no existe o no pertenece al tenant`);
    this.name = 'CategoryNotFoundException';
  }
}

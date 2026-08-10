export class ProductNotFoundException extends Error {
  constructor(productId: string) {
    super(`El producto ${productId} no existe o no pertenece al tenant`);
    this.name = 'ProductNotFoundException';
  }
}

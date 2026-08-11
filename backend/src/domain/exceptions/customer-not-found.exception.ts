export class CustomerNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Cliente no encontrado con identificador: ${identifier}`);
    this.name = 'CustomerNotFoundException';
  }
}

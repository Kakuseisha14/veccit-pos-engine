export class ShiftAlreadyOpenException extends Error {
  constructor() {
    super('El cajero ya tiene un turno de caja abierto');
    this.name = 'ShiftAlreadyOpenException';
  }
}

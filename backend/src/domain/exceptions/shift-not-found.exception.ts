export class ShiftNotFoundException extends Error {
  constructor(id: string) {
    super(`No se encontro un turno de caja con id ${id}`);
    this.name = 'ShiftNotFoundException';
  }
}

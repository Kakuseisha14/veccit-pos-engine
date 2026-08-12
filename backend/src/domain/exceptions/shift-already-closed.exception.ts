export class ShiftAlreadyClosedException extends Error {
  constructor(id: string) {
    super(`El turno de caja ${id} ya se encuentra cerrado`);
    this.name = 'ShiftAlreadyClosedException';
  }
}

export class ExchangeRateNotSetException extends Error {
  constructor() {
    super('No hay una tasa de cambio activa configurada para el día de hoy');
    this.name = 'ExchangeRateNotSetException';
  }
}

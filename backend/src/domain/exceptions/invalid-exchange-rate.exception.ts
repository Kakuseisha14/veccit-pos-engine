export class InvalidExchangeRateException extends Error {
  constructor(rateVES: number) {
    super(`La tasa de cambio ${rateVES} no es valida (debe ser mayor a 0)`);
    this.name = 'InvalidExchangeRateException';
  }
}

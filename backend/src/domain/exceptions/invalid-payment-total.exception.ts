export class InvalidPaymentTotalException extends Error {
  constructor(expectedUSD: number, receivedUSD: number) {
    super(
      `El total de pagos abonados ($${receivedUSD.toFixed(2)}) no coincide con el total de la venta ($${expectedUSD.toFixed(2)})`,
    );
    this.name = 'InvalidPaymentTotalException';
  }
}

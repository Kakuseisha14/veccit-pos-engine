export class InvalidSkuException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSkuException';
  }
}

export class Sku {
  private constructor(public readonly value: string) {}

  static from(raw: string): Sku {
    const value = raw.trim().toUpperCase();
    if (value.length === 0) {
      throw new InvalidSkuException('El SKU no puede estar vacio');
    }
    if (value.length > 40) {
      throw new InvalidSkuException(
        'El SKU no puede superar los 40 caracteres',
      );
    }
    return new Sku(value);
  }
}

export type Currency = 'USD' | 'VES';

export class InvalidMoneyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMoneyException';
  }
}

export class Money {
  constructor(
    public readonly amountMinorUnits: number,
    public readonly currency: Currency,
  ) {}

  static fromMajor(amount: number, currency: Currency): Money {
    if (!Number.isFinite(amount)) {
      throw new InvalidMoneyException('El monto debe ser un numero valido');
    }
    if (amount < 0) {
      throw new InvalidMoneyException('El monto no puede ser negativo');
    }
    return new Money(Math.round(amount * 100), currency);
  }

  static fromMinorUnits(amountMinorUnits: number, currency: Currency): Money {
    if (!Number.isInteger(amountMinorUnits)) {
      throw new InvalidMoneyException(
        'Las unidades menores deben ser un entero',
      );
    }
    if (amountMinorUnits < 0) {
      throw new InvalidMoneyException(
        'Las unidades menores no pueden ser negativas',
      );
    }
    return new Money(amountMinorUnits, currency);
  }

  toMajor(): number {
    return this.amountMinorUnits / 100;
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new InvalidMoneyException('No se pueden sumar divisas distintas');
    }
    return Money.fromMinorUnits(
      this.amountMinorUnits + other.amountMinorUnits,
      this.currency,
    );
  }

  subtract(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new InvalidMoneyException('No se pueden restar divisas distintas');
    }
    return Money.fromMinorUnits(
      this.amountMinorUnits - other.amountMinorUnits,
      this.currency,
    );
  }
}

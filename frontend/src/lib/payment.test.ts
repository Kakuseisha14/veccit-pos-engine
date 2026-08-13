import { describe, expect, it } from "vitest";
import {
  canConfirmPayment,
  computePaidCents,
  computeRemainingCents,
  computeTotalCents,
  hasUnpricedVesPayment,
  toCents,
} from "./payment";

describe("computeTotalCents", () => {
  it("suma precios y cantidades sin errores de punto flotante", () => {
    expect(
      computeTotalCents([
        { unitPriceUSD: 2.1, quantity: 3 },
        { unitPriceUSD: 0.35, quantity: 2 },
      ]),
    ).toBe(700);
  });

  it("evita errores de 0.1 + 0.2", () => {
    expect(
      computeTotalCents([{ unitPriceUSD: 0.1, quantity: 1 }, { unitPriceUSD: 0.2, quantity: 1 }]),
    ).toBe(30);
  });
});

describe("computePaidCents / computeRemainingCents", () => {
  it("convierte pagos VES a USD con la tasa del dia", () => {
    expect(
      computePaidCents(
        [
          { amount: "10", currency: "USD" },
          { amount: "325", currency: "VES" },
        ],
        32.5,
      ),
    ).toBe(2000);
  });

  it("ignora montos invalidos o negativos", () => {
    expect(
      computePaidCents(
        [
          { amount: "", currency: "USD" },
          { amount: "-5", currency: "USD" },
          { amount: "abc", currency: "USD" },
        ],
        null,
      ),
    ).toBe(0);
  });

  it("no agrega pagos VES si no hay tasa activa", () => {
    expect(
      computePaidCents([{ amount: "100", currency: "VES" }], null),
    ).toBe(0);
    expect(
      computePaidCents([{ amount: "100", currency: "VES" }], 0),
    ).toBe(0);
  });

  it("calcula el saldo restante con signo correcto", () => {
    expect(
      computeRemainingCents(20, [{ amount: "12.5", currency: "USD" }], null),
    ).toBe(750);
    expect(
      computeRemainingCents(20, [{ amount: "25", currency: "USD" }], null),
    ).toBe(-500);
  });
});

describe("canConfirmPayment", () => {
  it("aprueba quando el pago mixto cubre el total exacto", () => {
    expect(
      canConfirmPayment(
        20,
        [
          { amount: "10", currency: "USD" },
          { amount: "325", currency: "VES" },
        ],
        32.5,
      ),
    ).toBe(true);
  });

  it("aprueba con tolerancia de centavos por conversion", () => {
    expect(canConfirmPayment(20, [{ amount: "19.98", currency: "USD" }], null)).toBe(
      true,
    );
    expect(canConfirmPayment(20, [{ amount: "20.02", currency: "USD" }], null)).toBe(
      true,
    );
  });

  it("rechaza cuando el pago no cubre el total", () => {
    expect(canConfirmPayment(20, [{ amount: "10", currency: "USD" }], null)).toBe(
      false,
    );
  });

  it("rechaza pagos VES sin tasa", () => {
    expect(
      canConfirmPayment(
        20,
        [
          { amount: "10", currency: "USD" },
          { amount: "325", currency: "VES" },
        ],
        null,
      ),
    ).toBe(false);
  });
});

describe("hasUnpricedVesPayment", () => {
  it("detecta pagos en VES", () => {
    expect(
      hasUnpricedVesPayment([
        { amount: "10", currency: "USD" },
        { amount: "100", currency: "VES" },
      ]),
    ).toBe(true);
    expect(
      hasUnpricedVesPayment([{ amount: "10", currency: "USD" }]),
    ).toBe(false);
  });
});

describe("toCents", () => {
  it("redondea centavos correctamente", () => {
    expect(toCents(10.999)).toBe(1100);
    expect(toCents(0.005)).toBe(1);
  });
});
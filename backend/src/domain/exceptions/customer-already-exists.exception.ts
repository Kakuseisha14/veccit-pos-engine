export class CustomerAlreadyExistsException extends Error {
  constructor(identification: string) {
    super(
      `Ya existe un cliente registrado con la identificación: ${identification}`,
    );
    this.name = 'CustomerAlreadyExistsException';
  }
}

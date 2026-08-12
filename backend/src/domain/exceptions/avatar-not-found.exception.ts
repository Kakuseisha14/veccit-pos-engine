export class AvatarNotFoundException extends Error {
  constructor() {
    super('Avatar no encontrado');
    this.name = 'AvatarNotFoundException';
  }
}

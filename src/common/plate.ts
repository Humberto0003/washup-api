const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export function normalizePlate(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
}

export function isValidPlate(plate: string): boolean {
  return PLATE_REGEX.test(normalizePlate(plate));
}

export function assertValidPlate(plate: string): string {
  const normalizedPlate = normalizePlate(plate);

  if (!isValidPlate(normalizedPlate)) {
    throw new Error('Placa invalida.');
  }

  return normalizedPlate;
}

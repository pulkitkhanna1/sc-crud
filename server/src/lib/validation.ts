export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function requireString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required.`);
  }

  return value.trim();
}

export function optionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseDateInput(value: unknown, fieldName: string) {
  const dateValue = requireString(value, fieldName);
  const parsed = new Date(`${dateValue}T12:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`${fieldName} must be a valid date.`);
  }

  return parsed;
}

export function parseDateTimeInput(value: unknown, fieldName: string) {
  const dateValue = requireString(value, fieldName);
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`${fieldName} must be a valid datetime.`);
  }

  return parsed;
}

export function parseEnumValue<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string,
) {
  const rawValue = requireString(value, fieldName) as T;

  if (!allowedValues.includes(rawValue)) {
    throw new AppError(`${fieldName} is invalid.`);
  }

  return rawValue;
}

export const ValidationErrorSymbol = 'ValidationError';

export interface ValidationError {
  $$symbol: typeof ValidationErrorSymbol;
  name: string;
  eachPrefix?: string;
  path?: string | number;
  fullPath?: string;
  message: string;
  value?: any;
  children?: ValidationError[];
}

export function isValidationError(source: unknown): source is ValidationError {
  return (
    !!source &&
    typeof source === 'object' &&
    '__symbol__' in (source as any) &&
    (source as ValidationError).$$symbol === ValidationErrorSymbol
  );
}

export const ValidateCancelSymbol = '__ValidateCancelSymbol__';

export function isValidateCancelSymbol(
  source: any,
): source is typeof ValidateCancelSymbol {
  return source === ValidateCancelSymbol;
}

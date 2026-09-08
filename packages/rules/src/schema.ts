/**
 * Symbol indicating a validation error.
 */
export const VALIDATION_ERROR_SYMBOL = 'ValidationError';

/**
 * Validation error.
 */
export interface ValidationError {
  /**
   * Symbol indicating a validation error.
   *
   * @see {@link VALIDATION_ERROR_SYMBOL}
   */
  $$symbol: typeof VALIDATION_ERROR_SYMBOL;
  /** Failed validation rule name. */
  name: string;
  /** Prefix for the path during object enumeration. */
  eachPrefix?: string;
  /** Property name during object enumeration. */
  path?: string | number;
  /** Full path to the property during object enumeration. */
  fullPath?: string;
  /** Error message. */
  message: string;
  /** Failed validation value. */
  value?: any;
  /** List of errors for descendant properties if it's an error for an object. */
  children?: ValidationError[];
  /** Constraints set in the rule. */
  constraints?: any;
}

/**
 * Check if the specified value is a validation error.
 *
 * @param source - Value to be checked.
 * @returns `true` if it is a validation error.
 */
export function isValidationError(source: unknown): source is ValidationError {
  return (
    !!source &&
    typeof source === 'object' &&
    (source as ValidationError).$$symbol === VALIDATION_ERROR_SYMBOL
  );
}

/**
 * Symbol indicating validation cancellation.
 */
export const VALIDATE_CANCEL_SYMBOL = '__VALIDATE_CANCEL_SYMBOL__';

/**
 * Check if the specified value is a symbol for validation cancellation.
 *
 * @param source - Value to be checked.
 * @returns `true` if it is a symbol for cancellation.
 */
export function isValidateCancelSymbol(
  source: unknown,
): source is typeof VALIDATE_CANCEL_SYMBOL {
  return source === VALIDATE_CANCEL_SYMBOL;
}

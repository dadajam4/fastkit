const PALETTE = {
  reset: '\u001b[0m',
  // black: '\u001b[30m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  // blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  // white: '\u001b[37m'
};

export type ConsoleColorPaletteName = keyof typeof PALETTE;

export function consoleColorString(
  message: string,
  color: ConsoleColorPaletteName,
) {
  const colorOpenTag = PALETTE[color];
  const colorCloseTag = colorOpenTag ? PALETTE.reset : '';
  return `${colorOpenTag}${message}${colorCloseTag}`;
}

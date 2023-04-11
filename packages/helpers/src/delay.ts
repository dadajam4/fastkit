/**
 * Obtains a Promise instance that will be resolved after the specified time
 * @param milliseconds - Delay time(millisecond)
 * @returns Promise Instance
 */
export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const secretValueMatchRe = /(password|x-api-key)/i;

export function passwordFilter(key: string, value: any) {
  if (typeof value !== 'string') return value;
  if (!secretValueMatchRe.test(key)) return value;
  const rawString = value.slice(0, 3);
  const maskedString = value.slice(3, value.length);
  return `${rawString}${'#'.repeat(maskedString.length)}`;
}

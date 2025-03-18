import { SassPreprocessorOptions } from 'vite';

export async function resolveAdditionalData(
  source: string,
  filename: string,
  additionalData: SassPreprocessorOptions['additionalData'],
): Promise<string> {
  if (typeof additionalData === 'string') {
    return additionalData + source;
  }

  if (typeof additionalData === 'function') {
    const data = additionalData(source, filename);

    // データが文字列の場合
    if (typeof data === 'string') {
      return data;
    }

    // データがcontent属性を持つオブジェクトの場合
    if (typeof data === 'object' && 'content' in data) {
      return data.content;
    }

    // データがPromiseの場合
    const resolvedData = await data;
    if (typeof resolvedData === 'string') {
      return resolvedData;
    }
    if (typeof resolvedData === 'object' && 'content' in resolvedData) {
      return resolvedData.content;
    }
  }

  return '';
}

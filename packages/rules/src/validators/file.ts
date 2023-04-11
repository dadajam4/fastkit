import { CompareCondition, compareValueByCompareConditions } from './compare';

/**
 * ファイルのバリデーション系情報
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

/**
 * 画像のサイズ情報
 */
export interface ImageInfo {
  width: number;
  height: number;
  ratio: number;

  /**
   * 画像の読み込みに失敗した時
   */
  error?: string;
}

/**
 * 画像ファイルのバリデーション系情報
 */
export interface ImageFileInfo extends FileInfo, ImageInfo {}

/**
 * ファイルのバリデーション系情報をファイルオブジェクから取得する
 */
export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * 画像ファイルのバリデーション系情報をファイルオブジェクから取得する
 */
export async function getImageFileInfo(file: File): Promise<ImageFileInfo> {
  const dimension = await getImageDimension(file);
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    ...dimension,
  };
}

/**
 * 画像のURL or ファイルオブジェクトから画像のサイズ情報を取得する
 */
export function getImageDimension(
  pathOrfile: string | File,
): Promise<ImageInfo> {
  const URL = window.URL || ((window as any).webkitURL as URL);
  const isFile = typeof pathOrfile !== 'string';

  return new Promise((resolve, reject) => {
    const src = isFile ? URL.createObjectURL(pathOrfile) : <string>pathOrfile;
    const image = new Image();

    image.onerror = (e) => {
      isFile && URL.revokeObjectURL(src);
      reject(e);
    };

    image.onload = () => {
      isFile && URL.revokeObjectURL(src);
      const { width, height } = image;
      resolve({
        width,
        height,
        ratio: width / height,
      });
    };

    image.src = src;
  });
}

/**
 * 画像サイズのバリデーション条件
 */
export interface ImageFileDimensionConditions {
  width?: CompareCondition[];
  height?: CompareCondition[];
  ratio?: CompareCondition[];
}

/**
 * 画像サイズのバリデーション条件
 */
export type ImageFileDimensionInputConditions = {
  [P in keyof ImageFileDimensionConditions]?: string | string[];
  // width?: string;
};

/**
 * 画像サイズの属性（width, height, ratio）毎のバリデーションエラー情報
 */
export interface ImageFileDimensionRowError {
  actual: number;
  conditions: CompareCondition[];
}

/**
 * 画像サイズのバリデーションエラー情報
 */
export type ImageFileDimensionError = {
  [P in keyof ImageFileDimensionConditions]?: ImageFileDimensionRowError;
};

/**
 * 画像サイズのバリデーションキーリスト
 */
const IMAGE_DIMENSION_VALIDATE_KEYS: (keyof ImageFileDimensionConditions)[] = [
  'width',
  'height',
  'ratio',
];

/**
 * 画像ファイルのサイズバリデーションを行う
 */
export async function getImageFileDimensionErrors(
  file: File,
  conditions: ImageFileDimensionConditions,
): Promise<ImageFileDimensionError | null> {
  const info = await getImageFileInfo(file);
  let errors: ImageFileDimensionError | null = null;
  IMAGE_DIMENSION_VALIDATE_KEYS.forEach((key) => {
    const rowConditions = conditions[key];
    const value = info[key];
    if (
      rowConditions &&
      !compareValueByCompareConditions(info[key], rowConditions)
    ) {
      errors = errors || {};
      errors[key] = {
        actual: value,
        conditions: rowConditions,
      };
    }
  });
  return errors;
}

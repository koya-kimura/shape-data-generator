import { CanvasConfig, GenerationConfig } from './types';

/**
 * デフォルトのキャンバス設定
 */
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
    imageSize: 64,
    backgroundColor: '#000000',
    margin: 5,
};

/**
 * デフォルトの生成設定
 */
export const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
    sampleCount: 1000,
    imageSize: 64,
    seed: 42,
    sizeMin: 0.3,
    sizeMax: 1.0,
    angleMin: 0,
    angleMax: 360,
    verticesMin: 3,
    verticesMax: 8,
    colorRMin: 0.0,
    colorRMax: 1.0,
    colorGMin: 0.0,
    colorGMax: 1.0,
    colorBMin: 0.0,
    colorBMax: 1.0,
};

/**
 * プレビューで表示する画像数
 */
export const PREVIEW_COUNT = 9;

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
    shapeType: 'both',
    backgroundType: 'black',
    positionType: 'random',
    sizeMin: 0.3,
    sizeMax: 1.0,
    angleMin: 0,
    angleMax: 360,
    verticesMin: 3,
    verticesMax: 8,
    hueMin: 0,
    hueMax: 360,
    saturationMin: 0.5,
    saturationMax: 1.0,
    lightnessMin: 0.3,
    lightnessMax: 0.7,
};

/**
 * プレビューで表示する画像数
 */
export const PREVIEW_COUNT = 9;

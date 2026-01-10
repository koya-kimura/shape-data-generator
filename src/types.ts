/**
 * 図形タイプ
 */
export type ShapeType = 'polygon' | 'circle';

/**
 * 背景色タイプ
 */
export type BackgroundType = 'white' | 'black' | 'gray' | 'random';

/**
 * 位置タイプ
 */
export type PositionType = 'random' | 'center';

/**
 * 図形生成のパラメータ
 */
export interface ShapeParams {
    /** 図形タイプ（polygon or circle） */
    shapeType: ShapeType;
    /** サイズ（画像に対する割合 0.3〜1.0） */
    size: number;
    /** 回転角度（度）- 多角形のみ使用 */
    angle: number;
    /** 頂点数（多角形のみ使用、円の場合は0） */
    vertices: number;
    /** 中心X座標（正規化: 0.0〜1.0） */
    centerX: number;
    /** 中心Y座標（正規化: 0.0〜1.0） */
    centerY: number;
    /** 色相（0〜360度） */
    hue: number;
    /** 彩度（0.0〜1.0） */
    saturation: number;
    /** 明るさ（0.0〜1.0） */
    lightness: number;
}

/**
 * キャンバスの設定
 */
export interface CanvasConfig {
    /** 画像サイズ（正方形の一辺） */
    imageSize: number;
    /** 背景色 */
    backgroundColor: string;
    /** マージン（ピクセル） */
    margin: number;
}

/**
 * 生成設定
 */
export interface GenerationConfig {
    /** サンプル数 */
    sampleCount: number;
    /** 画像サイズ */
    imageSize: number;
    /** 乱数シード（null でランダム） */
    seed: number | null;
    /** 図形タイプ（polygon, circle, or both） */
    shapeType: 'polygon' | 'circle' | 'both';
    /** 背景色タイプ */
    backgroundType: BackgroundType;
    /** 位置タイプ */
    positionType: PositionType;
    /** サイズの最小値 */
    sizeMin: number;
    /** サイズの最大値 */
    sizeMax: number;
    /** 角度の最小値（度） */
    angleMin: number;
    /** 角度の最大値（度） */
    angleMax: number;
    /** 頂点数の最小値 */
    verticesMin: number;
    /** 頂点数の最大値 */
    verticesMax: number;
    /** 色相の最小値 */
    hueMin: number;
    /** 色相の最大値 */
    hueMax: number;
    /** 彩度の最小値 */
    saturationMin: number;
    /** 彩度の最大値 */
    saturationMax: number;
    /** 明るさの最小値 */
    lightnessMin: number;
    /** 明るさの最大値 */
    lightnessMax: number;
}

/**
 * メタデータ行
 */
export interface MetadataRow {
    /** ファイル名 */
    filename: string;
    /** 図形タイプ（polygon or circle） */
    shape_type: string;
    /** サイズ（0.3〜1.0） */
    size: number;
    /** 回転角度（度） */
    angle: number;
    /** 頂点数（円の場合は0） */
    vertices: number;
    /** 中心X座標（正規化: 0.0〜1.0） */
    center_x: number;
    /** 中心Y座標（正規化: 0.0〜1.0） */
    center_y: number;
    /** 色相（0〜360度） */
    hue: number;
    /** 彩度（0.0〜1.0） */
    saturation: number;
    /** 明るさ（0.0〜1.0） */
    lightness: number;
    /** 背景色相（0〜360度） */
    bg_hue: number;
    /** 背景彩度（0.0〜1.0） */
    bg_saturation: number;
    /** 背景明るさ（0.0〜1.0） */
    bg_lightness: number;
}

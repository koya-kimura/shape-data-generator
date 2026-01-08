/**
 * 図形生成のパラメータ
 */
export interface ShapeParams {
    /** サイズ（画像に対する割合 0.3〜1.0） */
    size: number;
    /** 回転角度（度） */
    angle: number;
    /** 頂点数 */
    vertices: number;
    /** 中心X座標（正規化: 0.0〜1.0） */
    centerX: number;
    /** 中心Y座標（正規化: 0.0〜1.0） */
    centerY: number;
    /** 色相（0〜360度） */
    hue: number;
    /** 彩度（0.0〜1.0） */
    saturation: number;
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
}

/**
 * メタデータ行
 */
export interface MetadataRow {
    /** ファイル名 */
    filename: string;
    /** サイズ（0.3〜1.0） */
    size: number;
    /** 回転角度（度） */
    angle: number;
    /** 頂点数 */
    vertices: number;
    /** 中心X座標（正規化: 0.0〜1.0） */
    center_x: number;
    /** 中心Y座標（正規化: 0.0〜1.0） */
    center_y: number;
    /** 色相（0〜360度） */
    hue: number;
    /** 彩度（0.0〜1.0） */
    saturation: number;
}

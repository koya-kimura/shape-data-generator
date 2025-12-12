import { ShapeParams, CanvasConfig } from './types';

/**
 * シード付き乱数生成器（Mulberry32）
 */
export class SeededRandom {
    private state: number;

    constructor(seed: number) {
        this.state = seed;
    }

    /**
     * 0〜1のランダムな浮動小数点数を返す
     */
    next(): number {
        let t = this.state += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    /**
     * 指定範囲のランダムな浮動小数点数を返す
     */
    nextFloat(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    /**
     * 指定範囲のランダムな整数を返す（両端含む）
     */
    nextInt(min: number, max: number): number {
        return Math.floor(this.nextFloat(min, max + 1));
    }
}

/**
 * 正多角形を描画するクラス
 */
export class ShapeGenerator {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private config: CanvasConfig;

    constructor(canvas: HTMLCanvasElement, config: CanvasConfig) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas context not available');
        }
        this.ctx = ctx;
        this.config = config;
        this.updateCanvasSize();
    }

    /**
     * キャンバスサイズを更新
     */
    updateCanvasSize(): void {
        this.canvas.width = this.config.imageSize;
        this.canvas.height = this.config.imageSize;
    }

    /**
     * 設定を更新
     */
    updateConfig(config: Partial<CanvasConfig>): void {
        this.config = { ...this.config, ...config };
        this.updateCanvasSize();
    }

    /**
     * キャンバスをクリア（黒背景）
     */
    clear(): void {
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 正多角形の頂点を計算
     * 最初の頂点が上向きを0度とする
     */
    calculatePolygonPoints(
        centerX: number,
        centerY: number,
        radius: number,
        vertices: number,
        angleDeg: number
    ): { x: number; y: number }[] {
        const points: { x: number; y: number }[] = [];
        const angleRad = angleDeg * Math.PI / 180;

        for (let i = 0; i < vertices; i++) {
            // 最初の頂点を上向きにするため -π/2 を加算
            const theta = angleRad + (2 * Math.PI * i / vertices) - Math.PI / 2;
            const x = centerX + radius * Math.cos(theta);
            const y = centerY + radius * Math.sin(theta);
            points.push({ x, y });
        }

        return points;
    }

    /**
     * RGB値からCSS色文字列を生成
     */
    rgbToColor(r: number, g: number, b: number): string {
        const ri = Math.round(r * 255);
        const gi = Math.round(g * 255);
        const bi = Math.round(b * 255);
        return `rgb(${ri}, ${gi}, ${bi})`;
    }

    /**
     * 正多角形を描画（塗りつぶし）
     */
    drawShape(params: ShapeParams): void {
        const { size, angle, vertices, centerX, centerY, colorR, colorG, colorB } = params;

        // 正規化された座標から実際のピクセル座標に変換
        const actualCenterX = centerX * this.config.imageSize;
        const actualCenterY = centerY * this.config.imageSize;
        const maxRadius = (this.config.imageSize / 2) - this.config.margin;
        const radius = size * maxRadius;

        const points = this.calculatePolygonPoints(actualCenterX, actualCenterY, radius, vertices, angle);
        const fillColor = this.rgbToColor(colorR, colorG, colorB);

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
    }

    /**
     * キャンバス全体を描画（クリア + 図形描画）
     */
    render(params: ShapeParams): void {
        this.clear();
        this.drawShape(params);
    }

    /**
     * キャンバスをBlob形式で取得
     */
    async toBlob(type: string = 'image/png'): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            }, type);
        });
    }

    /**
     * キャンバスをData URL形式で取得
     */
    toDataURL(type: string = 'image/png'): string {
        return this.canvas.toDataURL(type);
    }

    /**
     * 現在の設定を取得
     */
    getConfig(): CanvasConfig {
        return { ...this.config };
    }
}

/**
 * ランダムな図形パラメータを生成
 * 図形全体が画像内に収まるように中心位置を計算
 */
export function generateRandomParams(
    rng: SeededRandom | null,
    imageSize: number,
    margin: number,
    sizeMin: number,
    sizeMax: number,
    angleMin: number,
    angleMax: number,
    verticesMin: number,
    verticesMax: number,
    colorRMin: number,
    colorRMax: number,
    colorGMin: number,
    colorGMax: number,
    colorBMin: number,
    colorBMax: number
): ShapeParams {
    const random = rng || {
        nextFloat: (min: number, max: number) => min + Math.random() * (max - min),
        nextInt: (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1)),
    };

    // 範囲の最小値 > 最大値の場合は入れ替える
    const [sMin, sMax] = sizeMin <= sizeMax ? [sizeMin, sizeMax] : [sizeMax, sizeMin];
    const [aMin, aMax] = angleMin <= angleMax ? [angleMin, angleMax] : [angleMax, angleMin];
    const [vMin, vMax] = verticesMin <= verticesMax ? [verticesMin, verticesMax] : [verticesMax, verticesMin];
    const [rMin, rMax] = colorRMin <= colorRMax ? [colorRMin, colorRMax] : [colorRMax, colorRMin];
    const [gMin, gMax] = colorGMin <= colorGMax ? [colorGMin, colorGMax] : [colorGMax, colorGMin];
    const [bMin, bMax] = colorBMin <= colorBMax ? [colorBMin, colorBMax] : [colorBMax, colorBMin];

    // サイズを決定
    const size = random.nextFloat(sMin, sMax);
    
    // 最大半径（ピクセル）
    const maxRadius = (imageSize / 2) - margin;
    const radius = size * maxRadius;
    
    // 図形が画像内に収まるように中心位置の範囲を計算
    // 中心から半径分の余裕を持たせる + マージン
    const minCenter = (radius + margin) / imageSize;
    const maxCenter = 1 - minCenter;
    
    // 中心位置をランダムに決定（正規化座標）
    let centerX: number;
    let centerY: number;
    
    if (minCenter >= maxCenter) {
        // 図形が大きすぎる場合は中央に配置
        centerX = 0.5;
        centerY = 0.5;
    } else {
        centerX = random.nextFloat(minCenter, maxCenter);
        centerY = random.nextFloat(minCenter, maxCenter);
    }

    return {
        size,
        angle: random.nextFloat(aMin, aMax),
        vertices: random.nextInt(Math.max(3, vMin), vMax),
        centerX,
        centerY,
        colorR: random.nextFloat(rMin, rMax),
        colorG: random.nextFloat(gMin, gMax),
        colorB: random.nextFloat(bMin, bMax),
    };
}

/**
 * ゼロパディングされたファイル名を生成
 * 枚数に応じて桁数を自動調整
 */
export function formatFilename(index: number, totalCount: number): string {
    // totalCountの桁数を取得（最低4桁）
    const digits = Math.max(4, totalCount.toString().length);
    return index.toString().padStart(digits, '0') + '.png';
}

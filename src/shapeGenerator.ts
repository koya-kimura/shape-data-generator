import { ShapeParams, ShapeType, BackgroundType, PositionType, CanvasConfig } from './types';

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
     * キャンバスをクリア（指定色で塗りつぶし）
     */
    clear(color: string): void {
        this.ctx.fillStyle = color;
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
     * HSLからRGBに変換
     * @param h 色相 (0-360)
     * @param s 彩度 (0-1)
     * @param l 明度 (0-1)
     * @returns [r, g, b] 各値 0-1
     */
    hslToRgb(h: number, s: number, l: number): [number, number, number] {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r = 0, g = 0, b = 0;
        if (h >= 0 && h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (h >= 60 && h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (h >= 120 && h < 180) {
            [r, g, b] = [0, c, x];
        } else if (h >= 180 && h < 240) {
            [r, g, b] = [0, x, c];
        } else if (h >= 240 && h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }

        return [r + m, g + m, b + m];
    }

    /**
     * HSL値からCSS色文字列を生成
     */
    hslToColor(h: number, s: number, l: number): string {
        const [r, g, b] = this.hslToRgb(h, s, l);
        const ri = Math.round(r * 255);
        const gi = Math.round(g * 255);
        const bi = Math.round(b * 255);
        return `rgb(${ri}, ${gi}, ${bi})`;
    }

    /**
     * 図形を描画（塗りつぶし）
     */
    drawShape(params: ShapeParams): void {
        const { shapeType, size, angle, vertices, centerX, centerY, hue, saturation, lightness } = params;

        // 正規化された座標から実際のピクセル座標に変換
        const actualCenterX = centerX * this.config.imageSize;
        const actualCenterY = centerY * this.config.imageSize;
        const maxRadius = (this.config.imageSize / 2) - this.config.margin;
        const radius = size * maxRadius;

        const fillColor = this.hslToColor(hue, saturation, lightness);

        this.ctx.beginPath();

        if (shapeType === 'circle') {
            // 円を描画
            this.ctx.arc(actualCenterX, actualCenterY, radius, 0, Math.PI * 2);
        } else {
            // 多角形を描画
            const points = this.calculatePolygonPoints(actualCenterX, actualCenterY, radius, vertices, angle);
            this.ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
        }

        this.ctx.closePath();
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
    }

    /**
     * キャンバス全体を描画（クリア + 図形描画）
     */
    renderWithBackground(params: ShapeParams, bgHue: number, bgSaturation: number, bgLightness: number): void {
        const bgColor = this.hslToColor(bgHue, bgSaturation, bgLightness);
        this.clear(bgColor);
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
    shapeTypeSetting: 'polygon' | 'circle' | 'both',
    positionType: PositionType,
    sizeMin: number,
    sizeMax: number,
    angleMin: number,
    angleMax: number,
    verticesMin: number,
    verticesMax: number,
    hueMin: number,
    hueMax: number,
    saturationMin: number,
    saturationMax: number,
    lightnessMin: number,
    lightnessMax: number
): ShapeParams {
    const random = rng || {
        nextFloat: (min: number, max: number) => min + Math.random() * (max - min),
        nextInt: (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1)),
        next: () => Math.random(),
    };

    // 図形タイプを決定
    let shapeType: ShapeType;
    if (shapeTypeSetting === 'both') {
        shapeType = random.next() < 0.5 ? 'polygon' : 'circle';
    } else {
        shapeType = shapeTypeSetting;
    }

    // 範囲の最小値 > 最大値の場合は入れ替える
    const [sMin, sMax] = sizeMin <= sizeMax ? [sizeMin, sizeMax] : [sizeMax, sizeMin];
    const [aMin, aMax] = angleMin <= angleMax ? [angleMin, angleMax] : [angleMax, angleMin];
    const [vMin, vMax] = verticesMin <= verticesMax ? [verticesMin, verticesMax] : [verticesMax, verticesMin];
    const [hMin, hMax] = hueMin <= hueMax ? [hueMin, hueMax] : [hueMax, hueMin];
    const [satMin, satMax] = saturationMin <= saturationMax ? [saturationMin, saturationMax] : [saturationMax, saturationMin];
    const [lMin, lMax] = lightnessMin <= lightnessMax ? [lightnessMin, lightnessMax] : [lightnessMax, lightnessMin];

    // サイズを決定
    const size = random.nextFloat(sMin, sMax);

    // 中心位置を決定（正規化座標）
    let centerX: number;
    let centerY: number;

    if (positionType === 'center') {
        // 中心に固定
        centerX = 0.5;
        centerY = 0.5;
    } else {
        // ランダム位置
        // 最大半径（ピクセル）
        const maxRadius = (imageSize / 2) - margin;
        const radius = size * maxRadius;

        // 図形が画像内に収まるように中心位置の範囲を計算
        const minCenter = (radius + margin) / imageSize;
        const maxCenter = 1 - minCenter;

        if (minCenter >= maxCenter) {
            // 図形が大きすぎる場合は中央に配置
            centerX = 0.5;
            centerY = 0.5;
        } else {
            centerX = random.nextFloat(minCenter, maxCenter);
            centerY = random.nextFloat(minCenter, maxCenter);
        }
    }

    return {
        shapeType,
        size,
        angle: shapeType === 'circle' ? 0 : random.nextFloat(aMin, aMax),
        vertices: shapeType === 'circle' ? 0 : random.nextInt(Math.max(3, vMin), vMax),
        centerX,
        centerY,
        hue: random.nextFloat(hMin, hMax),
        saturation: random.nextFloat(satMin, satMax),
        lightness: random.nextFloat(lMin, lMax),
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

/**
 * 背景色タイプからHSL値を取得
 * @param backgroundType 背景色タイプ
 * @param rng 乱数生成器（randomの場合に使用）
 * @returns [hue, saturation, lightness]
 */
export function getBackgroundHSL(
    backgroundType: BackgroundType,
    rng: SeededRandom | null
): [number, number, number] {
    const random = rng || { next: () => Math.random() };

    switch (backgroundType) {
        case 'white':
            return [0, 0, 1.0];  // 白: 明度 1.0
        case 'black':
            return [0, 0, 0.0];  // 黒: 明度 0.0
        case 'gray':
            return [0, 0, 0.5];  // グレー: 明度 0.5
        case 'random':
            // ランダムに白・黒・グレーのいずれか
            const choice = Math.floor(random.next() * 3);
            if (choice === 0) return [0, 0, 0.0];      // 黒
            if (choice === 1) return [0, 0, 1.0];      // 白
            return [0, 0, 0.5];                        // グレー
        default:
            return [0, 0, 0.0];  // デフォルトは黒
    }
}

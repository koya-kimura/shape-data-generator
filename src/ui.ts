import { ShapeGenerator, SeededRandom, generateRandomParams, formatFilename } from './shapeGenerator';
import { CanvasConfig, GenerationConfig, MetadataRow, ShapeParams } from './types';
import { DEFAULT_CANVAS_CONFIG, DEFAULT_GENERATION_CONFIG, PREVIEW_COUNT } from './config';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * UIコントロールとイベントハンドリングを管理するクラス
 */
export class UIController {
    private generator: ShapeGenerator;
    private canvasConfig: CanvasConfig;

    constructor(canvas: HTMLCanvasElement) {
        this.canvasConfig = { ...DEFAULT_CANVAS_CONFIG };
        this.generator = new ShapeGenerator(canvas, this.canvasConfig);

        this.initializeEventListeners();
    }

    /**
     * フォームから生成設定を取得
     */
    private getGenerationConfig(): GenerationConfig {
        const sampleCountInput = document.getElementById('sample-count') as HTMLInputElement;
        const imageSizeInput = document.getElementById('image-size') as HTMLInputElement;
        const randomSeedInput = document.getElementById('random-seed') as HTMLInputElement;
        const sizeMinInput = document.getElementById('size-min') as HTMLInputElement;
        const sizeMaxInput = document.getElementById('size-max') as HTMLInputElement;
        const angleMinInput = document.getElementById('angle-min') as HTMLInputElement;
        const angleMaxInput = document.getElementById('angle-max') as HTMLInputElement;
        const verticesMinInput = document.getElementById('vertices-min') as HTMLInputElement;
        const verticesMaxInput = document.getElementById('vertices-max') as HTMLInputElement;
        const hueMinInput = document.getElementById('hue-min') as HTMLInputElement;
        const hueMaxInput = document.getElementById('hue-max') as HTMLInputElement;
        const saturationMinInput = document.getElementById('saturation-min') as HTMLInputElement;
        const saturationMaxInput = document.getElementById('saturation-max') as HTMLInputElement;

        const seedValue = randomSeedInput?.value.trim();
        const seed = seedValue ? parseInt(seedValue) : null;

        return {
            sampleCount: parseInt(sampleCountInput?.value || String(DEFAULT_GENERATION_CONFIG.sampleCount)),
            imageSize: parseInt(imageSizeInput?.value || String(DEFAULT_GENERATION_CONFIG.imageSize)),
            seed: isNaN(seed as number) ? null : seed,
            sizeMin: parseFloat(sizeMinInput?.value || String(DEFAULT_GENERATION_CONFIG.sizeMin)),
            sizeMax: parseFloat(sizeMaxInput?.value || String(DEFAULT_GENERATION_CONFIG.sizeMax)),
            angleMin: parseFloat(angleMinInput?.value || String(DEFAULT_GENERATION_CONFIG.angleMin)),
            angleMax: parseFloat(angleMaxInput?.value || String(DEFAULT_GENERATION_CONFIG.angleMax)),
            verticesMin: parseInt(verticesMinInput?.value || String(DEFAULT_GENERATION_CONFIG.verticesMin)),
            verticesMax: parseInt(verticesMaxInput?.value || String(DEFAULT_GENERATION_CONFIG.verticesMax)),
            hueMin: parseFloat(hueMinInput?.value || String(DEFAULT_GENERATION_CONFIG.hueMin)),
            hueMax: parseFloat(hueMaxInput?.value || String(DEFAULT_GENERATION_CONFIG.hueMax)),
            saturationMin: parseFloat(saturationMinInput?.value || String(DEFAULT_GENERATION_CONFIG.saturationMin)),
            saturationMax: parseFloat(saturationMaxInput?.value || String(DEFAULT_GENERATION_CONFIG.saturationMax)),
        };
    }

    /**
     * バリデーション
     */
    private validateConfig(config: GenerationConfig): string | null {
        if (config.sampleCount <= 0) {
            return 'サンプル数は1以上を指定してください';
        }
        if (config.imageSize < 16) {
            return '画像サイズは16px以上を指定してください';
        }
        if (config.verticesMin < 3) {
            return '頂点数の最小値は3以上を指定してください';
        }
        return null;
    }

    /**
     * イベントリスナーを初期化
     */
    private initializeEventListeners(): void {
        // プレビューボタン
        const previewBtn = document.getElementById('preview-btn') as HTMLButtonElement;
        previewBtn?.addEventListener('click', () => this.showPreview());

        // 生成ボタン
        const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
        generateBtn?.addEventListener('click', () => this.generateData());
    }

    /**
     * プレビューを表示
     */
    private showPreview(): void {
        const config = this.getGenerationConfig();
        const error = this.validateConfig(config);
        if (error) {
            alert(error);
            return;
        }

        const previewGrid = document.getElementById('preview-grid') as HTMLDivElement;
        previewGrid.innerHTML = '';

        // 一時的に画像サイズを設定
        this.canvasConfig.imageSize = config.imageSize;
        this.generator.updateConfig({ imageSize: config.imageSize });

        // シード設定（プレビュー用にランダムシード）
        const rng = new SeededRandom(Date.now());

        for (let i = 0; i < PREVIEW_COUNT; i++) {
            const params = generateRandomParams(
                rng,
                config.imageSize,
                this.canvasConfig.margin,
                config.sizeMin,
                config.sizeMax,
                config.angleMin,
                config.angleMax,
                config.verticesMin,
                config.verticesMax,
                config.hueMin,
                config.hueMax,
                config.saturationMin,
                config.saturationMax
            );

            this.generator.render(params);
            const dataUrl = this.generator.toDataURL();

            const item = this.createPreviewItem(dataUrl, params);
            previewGrid.appendChild(item);
        }
    }

    /**
     * プレビューアイテムを作成
     */
    private createPreviewItem(imageUrl: string, params: ShapeParams): HTMLDivElement {
        const item = document.createElement('div');
        item.className = 'preview-item';

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'preview-image-wrapper';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Preview: ${params.vertices} vertices`;
        imageWrapper.appendChild(img);

        const info = document.createElement('div');
        info.className = 'preview-info';
        info.innerHTML = `
            <span>size: ${params.size.toFixed(2)}</span>
            <span>angle: ${params.angle.toFixed(1)}°</span>
            <span>vertices: ${params.vertices}</span>
            <span>center: (${params.centerX.toFixed(2)}, ${params.centerY.toFixed(2)})</span>
            <span>hue: ${params.hue.toFixed(1)}°, sat: ${params.saturation.toFixed(2)}</span>
        `;

        item.appendChild(imageWrapper);
        item.appendChild(info);

        return item;
    }

    /**
     * 進捗バーを更新
     */
    private updateProgress(current: number, total: number): void {
        const progressContainer = document.getElementById('progress-container') as HTMLDivElement;
        const progressFill = document.getElementById('progress-fill') as HTMLDivElement;
        const progressText = document.getElementById('progress-text') as HTMLParagraphElement;

        progressContainer.style.display = 'block';
        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `生成中... ${current} / ${total} (${percentage.toFixed(1)}%)`;
    }

    /**
     * 進捗バーを非表示
     */
    private hideProgress(): void {
        const progressContainer = document.getElementById('progress-container') as HTMLDivElement;
        progressContainer.style.display = 'none';
    }

    /**
     * データ生成を実行
     */
    private async generateData(): Promise<void> {
        const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
        const previewBtn = document.getElementById('preview-btn') as HTMLButtonElement;
        const originalText = generateBtn.innerHTML;

        const config = this.getGenerationConfig();
        const error = this.validateConfig(config);
        if (error) {
            alert(error);
            return;
        }

        try {
            generateBtn.disabled = true;
            previewBtn.disabled = true;
            generateBtn.innerHTML = '<span class="btn-icon">⏳</span> 生成中...';

            // 画像サイズを設定
            this.canvasConfig.imageSize = config.imageSize;
            this.generator.updateConfig({ imageSize: config.imageSize });

            // 乱数生成器
            const rng = config.seed !== null
                ? new SeededRandom(config.seed)
                : new SeededRandom(Math.floor(Math.random() * 2147483647));

            const zip = new JSZip();
            const imagesFolder = zip.folder('images');
            const metadata: MetadataRow[] = [];

            // バッチ処理のサイズ
            const batchSize = 100;
            const totalCount = config.sampleCount;

            for (let i = 1; i <= totalCount; i++) {
                const params = generateRandomParams(
                    rng,
                    config.imageSize,
                    this.canvasConfig.margin,
                    config.sizeMin,
                    config.sizeMax,
                    config.angleMin,
                    config.angleMax,
                    config.verticesMin,
                    config.verticesMax,
                    config.hueMin,
                    config.hueMax,
                    config.saturationMin,
                    config.saturationMax
                );

                // 画像生成
                this.generator.render(params);
                const blob = await this.generator.toBlob();
                const filename = formatFilename(i, totalCount);
                imagesFolder?.file(filename, blob);

                // メタデータ追加
                metadata.push({
                    filename,
                    size: params.size,
                    angle: params.angle,
                    vertices: params.vertices,
                    center_x: params.centerX,
                    center_y: params.centerY,
                    hue: params.hue,
                    saturation: params.saturation,
                });

                // 進捗更新（バッチごと）
                if (i % batchSize === 0 || i === totalCount) {
                    this.updateProgress(i, totalCount);
                    // UIを更新するため少し待つ
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            // CSV生成
            const csv = this.createCSV(metadata);
            zip.file('metadata.csv', csv);

            // ZIPファイルをダウンロード
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'shape-dataset.zip');

            this.hideProgress();
            alert(`データ生成が完了しました！\n${totalCount}枚の画像を生成しました。`);
        } catch (error) {
            console.error('Data generation failed:', error);
            alert('データ生成に失敗しました: ' + (error as Error).message);
            this.hideProgress();
        } finally {
            generateBtn.disabled = false;
            previewBtn.disabled = false;
            generateBtn.innerHTML = originalText;
        }
    }

    /**
     * CSV文字列を生成
     */
    private createCSV(data: MetadataRow[]): string {
        const header = 'filename,size,angle,vertices,center_x,center_y,hue,saturation\n';
        const rows = data.map(d =>
            `${d.filename},${d.size.toFixed(4)},${d.angle.toFixed(2)},${d.vertices},${d.center_x.toFixed(4)},${d.center_y.toFixed(4)},${d.hue.toFixed(2)},${d.saturation.toFixed(4)}`
        );
        return header + rows.join('\n');
    }
}

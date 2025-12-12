import './styles.css';
import { UIController } from './ui';

/**
 * アプリケーションのエントリーポイント
 */
function init(): void {
    const canvas = document.getElementById('shape-canvas') as HTMLCanvasElement;

    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // UIコントローラーを初期化
    new UIController(canvas);
}

// DOMの読み込み完了後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

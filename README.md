# 📐 Shape Polygons Dataset Generator

機械学習（特に条件付き拡散モデル）の学習用に設計された、正多角形画像データセットを生成するWebアプリケーションです。

## 概要

このツールは、ランダムなパラメータで正多角形を生成し、画像とメタデータ（CSV）をZIPファイルとしてダウンロードできます。MNISTのような標準的なデータセット形式で出力されます。

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで http://localhost:5173/ を開く
```

## 機能

- ✅ 正多角形（3〜8角形）の自動生成
- ✅ カスタマイズ可能なパラメータ（サイズ、角度、色、位置）
- ✅ プレビュー機能（9枚のサンプル表示）
- ✅ 進捗バー付きの大量生成
- ✅ 乱数シードによる再現性
- ✅ ZIPファイルでの一括ダウンロード

## 設定パラメータ

### 基本設定

| パラメータ | デフォルト | 説明 |
|-----------|-----------|------|
| サンプル数 | 1000 | 生成する画像の枚数 |
| 画像サイズ | 64 px | 正方形画像の1辺 |
| 乱数シード | 42 | 再現性のためのシード値 |

### 属性の範囲

| 属性 | 最小値 | 最大値 | 説明 |
|-----|--------|--------|------|
| サイズ | 0.3 | 1.0 | 画像に対する図形の割合 |
| 角度 | 0° | 360° | 回転角度 |
| 頂点数 | 3 | 8 | 多角形の頂点数 |
| R/G/B | 0.0 | 1.0 | 色成分 |

## 出力形式

### ディレクトリ構造

```
shape-dataset.zip
├── metadata.csv
└── images/
    ├── 0001.png
    ├── 0002.png
    └── ...
```

### 画像仕様

| 項目 | 値 |
|-----|-----|
| フォーマット | PNG (RGB) |
| サイズ | 64×64 px（設定可能） |
| 背景色 | 黒 (#000000) |
| 図形 | 塗りつぶしの正多角形 |

### メタデータ（CSV）

| カラム名 | 型 | 説明 | 値の範囲 |
|---------|-----|------|---------|
| `filename` | string | ファイル名 | `0001.png`, ... |
| `size` | float | 図形サイズ | 0.3 〜 1.0 |
| `angle` | float | 回転角度 | 0.0 〜 360.0 |
| `vertices` | int | 頂点数 | 3 〜 8 |
| `center_x` | float | 中心X座標 | 0.0 〜 1.0 |
| `center_y` | float | 中心Y座標 | 0.0 〜 1.0 |
| `color_r` | float | 赤成分 | 0.0 〜 1.0 |
| `color_g` | float | 緑成分 | 0.0 〜 1.0 |
| `color_b` | float | 青成分 | 0.0 〜 1.0 |

**CSVサンプル:**
```csv
filename,size,angle,vertices,center_x,center_y,color_r,color_g,color_b
0001.png,0.7523,45.32,4,0.4521,0.5832,1.0000,0.0000,0.0000
0002.png,0.5124,127.85,5,0.6234,0.3821,0.0000,0.8234,0.1523
```

## 使用方法

1. ブラウザでアプリを開く
2. 各パラメータを設定
3. 「プレビュー」ボタンでサンプルを確認
4. 「生成 & ダウンロード」ボタンでZIPファイルを取得

## データセットとしての公開

生成したデータセットをMNISTのように公開する方法については、以下のドキュメントを参照してください：

📄 **[データセット公開ガイド](./docs/DATASET_PUBLISHING_GUIDE.md)**

- Hugging Face での公開手順
- Python ローダーの作成方法
- 今後対応すべき事項のチェックリスト

## サンプルコード

### Python でデータセットを読み込む

```python
from examples.shape_polygons_loader import load_shape_polygons

# データ読み込み
images, metadata = load_shape_polygons("./data", split="train")
print(f"Images shape: {images.shape}")  # (60000, 64, 64, 3)
```

### PyTorch Dataset として使用

```python
from examples.shape_polygons_loader import ShapePolygonsDataset
from torchvision import transforms
from torch.utils.data import DataLoader

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

dataset = ShapePolygonsDataset("./data", split="train", transform=transform)
dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

for images, labels in dataloader:
    print(f"Batch shape: {images.shape}")
    print(f"Vertices: {labels['vertices']}")
    break
```

## プロジェクト構成

```
p5-shape-table-generator-with-data/
├── src/
│   ├── main.ts          # エントリーポイント
│   ├── ui.ts            # UIコントローラー
│   ├── shapeGenerator.ts # 図形生成ロジック
│   ├── types.ts         # 型定義
│   ├── config.ts        # デフォルト設定
│   └── styles.css       # スタイル
├── docs/
│   └── DATASET_PUBLISHING_GUIDE.md  # 公開ガイド
├── examples/
│   └── shape_polygons_loader.py     # Python ローダー
├── index.html
├── package.json
└── README.md
```

## 技術スタック

- TypeScript
- Vite
- HTML5 Canvas
- JSZip
- FileSaver.js

## ビルド

```bash
# 本番用ビルド
npm run build

# プレビュー
npm run preview
```

## ライセンス

MIT License

## 作者

きむらこうや

---

## 機械学習での使用目的

このデータセットは「条件付き拡散モデル」の学習に使用されます。

- **入力**: 属性値（size, angle, vertices, center, color）
- **出力**: 対応する図形画像

学習後、任意の属性値を指定して新しい図形画像を生成できるようになります。

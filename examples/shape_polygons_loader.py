"""
Shape Polygons Dataset Loader

このファイルはShape Polygonsデータセットをロードするためのサンプルコードです。
データセットをダウンロードして、NumPy配列やPyTorch Datasetとして使用できます。

使用例:
    # NumPy配列として読み込み
    images, metadata = load_shape_polygons("./data", split="train")
    
    # PyTorch Datasetとして使用
    dataset = ShapePolygonsDataset("./data", split="train", transform=transform)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
"""

import os
import urllib.request
import zipfile
import pandas as pd
from PIL import Image
import numpy as np
from typing import Tuple, Optional, Callable, Dict

# データセットのURL（公開後に更新）
DATASET_URL = "https://example.com/shape-polygons-dataset.zip"
VERSION = "1.0.0"


# =============================================================================
# NumPy ローダー
# =============================================================================

def load_shape_polygons(
    root: str = "./data",
    split: str = "train",
    download: bool = True
) -> Tuple[np.ndarray, pd.DataFrame]:
    """
    Shape Polygons Dataset をNumPy配列として読み込む
    
    Args:
        root: データ保存ディレクトリ
        split: "train" または "test"
        download: 未ダウンロードの場合にダウンロードするか
    
    Returns:
        images: (N, H, W, 3) の numpy 配列 (uint8)
        metadata: メタデータの pandas DataFrame
    
    Example:
        >>> images, metadata = load_shape_polygons("./data", split="train")
        >>> print(f"Images shape: {images.shape}")
        Images shape: (60000, 64, 64, 3)
        >>> print(metadata.columns.tolist())
        ['filename', 'size', 'angle', 'vertices', 'center_x', 'center_y', 
         'color_r', 'color_g', 'color_b']
    """
    dataset_dir = os.path.join(root, "shape-polygons", split)
    
    if download and not os.path.exists(dataset_dir):
        _download_and_extract(root)
    
    if not os.path.exists(dataset_dir):
        raise FileNotFoundError(
            f"Dataset not found at {dataset_dir}. "
            "Set download=True to download, or place the dataset manually."
        )
    
    # メタデータ読み込み
    csv_path = os.path.join(dataset_dir, "metadata.csv")
    metadata = pd.read_csv(csv_path)
    
    # 画像読み込み
    images_dir = os.path.join(dataset_dir, "images")
    images = []
    
    print(f"Loading {len(metadata)} images from {split}...")
    for i, filename in enumerate(metadata['filename']):
        img_path = os.path.join(images_dir, filename)
        img = Image.open(img_path).convert('RGB')
        images.append(np.array(img))
        
        if (i + 1) % 10000 == 0:
            print(f"  Loaded {i + 1}/{len(metadata)} images")
    
    print("Done!")
    return np.array(images, dtype=np.uint8), metadata


def _download_and_extract(root: str) -> None:
    """データセットをダウンロードして展開"""
    os.makedirs(root, exist_ok=True)
    zip_path = os.path.join(root, "shape-polygons.zip")
    
    print(f"Downloading Shape Polygons Dataset v{VERSION}...")
    print(f"URL: {DATASET_URL}")
    
    try:
        urllib.request.urlretrieve(DATASET_URL, zip_path)
    except Exception as e:
        raise RuntimeError(
            f"Failed to download dataset: {e}\n"
            "Please download manually and extract to {root}/shape-polygons/"
        )
    
    print("Extracting...")
    with zipfile.ZipFile(zip_path, 'r') as zf:
        zf.extractall(root)
    
    os.remove(zip_path)
    print("Download complete!")


# =============================================================================
# PyTorch Dataset
# =============================================================================

try:
    import torch
    from torch.utils.data import Dataset
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    Dataset = object  # ダミー


class ShapePolygonsDataset(Dataset):
    """
    Shape Polygons Dataset for PyTorch
    
    MNISTと同様のインターフェースで使用できます。
    
    Args:
        root: データ保存ディレクトリ
        split: "train" または "test"
        transform: 画像に適用する変換（torchvision.transforms）
        download: 未ダウンロードの場合にダウンロードするか
    
    Example:
        >>> from torchvision import transforms
        >>> 
        >>> transform = transforms.Compose([
        ...     transforms.ToTensor(),
        ...     transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        ... ])
        >>> 
        >>> train_dataset = ShapePolygonsDataset(
        ...     root="./data",
        ...     split="train",
        ...     transform=transform,
        ...     download=True
        ... )
        >>> 
        >>> image, labels = train_dataset[0]
        >>> print(image.shape)  # torch.Size([3, 64, 64])
        >>> print(labels['vertices'])  # tensor(5)
    """
    
    def __init__(
        self,
        root: str = "./data",
        split: str = "train",
        transform: Optional[Callable] = None,
        download: bool = True
    ):
        if not TORCH_AVAILABLE:
            raise ImportError(
                "PyTorch is required for ShapePolygonsDataset. "
                "Install with: pip install torch torchvision"
            )
        
        self.root = root
        self.split = split
        self.transform = transform
        
        dataset_dir = os.path.join(root, "shape-polygons", split)
        
        if download and not os.path.exists(dataset_dir):
            _download_and_extract(root)
        
        if not os.path.exists(dataset_dir):
            raise FileNotFoundError(
                f"Dataset not found at {dataset_dir}. "
                "Set download=True to download."
            )
        
        self.images_dir = os.path.join(dataset_dir, "images")
        self.metadata = pd.read_csv(
            os.path.join(dataset_dir, "metadata.csv")
        )
    
    def __len__(self) -> int:
        return len(self.metadata)
    
    def __getitem__(self, idx: int) -> Tuple:
        """
        Returns:
            image: 変換後の画像テンソル
            labels: 各属性を含む辞書
        """
        row = self.metadata.iloc[idx]
        
        # 画像読み込み
        img_path = os.path.join(self.images_dir, row['filename'])
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        # ラベル
        labels = {
            'size': torch.tensor(row['size'], dtype=torch.float32),
            'angle': torch.tensor(row['angle'], dtype=torch.float32),
            'vertices': torch.tensor(row['vertices'], dtype=torch.long),
            'center_x': torch.tensor(row['center_x'], dtype=torch.float32),
            'center_y': torch.tensor(row['center_y'], dtype=torch.float32),
            'color_r': torch.tensor(row['color_r'], dtype=torch.float32),
            'color_g': torch.tensor(row['color_g'], dtype=torch.float32),
            'color_b': torch.tensor(row['color_b'], dtype=torch.float32),
        }
        
        return image, labels
    
    def get_condition_vector(self, idx: int) -> 'torch.Tensor':
        """
        条件付き生成モデル用の条件ベクトルを取得
        
        すべての属性を0-1の範囲に正規化した8次元ベクトルを返します。
        
        Returns:
            torch.Tensor: shape (8,)
        """
        row = self.metadata.iloc[idx]
        return torch.tensor([
            row['size'],                    # 0.3-1.0 → そのまま
            row['angle'] / 360.0,           # 0-360 → 0-1
            (row['vertices'] - 3) / 5.0,    # 3-8 → 0-1
            row['center_x'],                # 0-1 → そのまま
            row['center_y'],                # 0-1 → そのまま
            row['color_r'],                 # 0-1 → そのまま
            row['color_g'],                 # 0-1 → そのまま
            row['color_b'],                 # 0-1 → そのまま
        ], dtype=torch.float32)


# =============================================================================
# ユーティリティ関数
# =============================================================================

def visualize_samples(
    images: np.ndarray,
    metadata: pd.DataFrame,
    n_samples: int = 16,
    figsize: Tuple[int, int] = (12, 12)
) -> None:
    """
    サンプル画像を可視化
    
    Args:
        images: 画像配列
        metadata: メタデータ
        n_samples: 表示するサンプル数
        figsize: 図のサイズ
    """
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        raise ImportError("matplotlib is required for visualization")
    
    n_cols = int(np.ceil(np.sqrt(n_samples)))
    n_rows = int(np.ceil(n_samples / n_cols))
    
    fig, axes = plt.subplots(n_rows, n_cols, figsize=figsize)
    axes = axes.flatten()
    
    indices = np.random.choice(len(images), n_samples, replace=False)
    
    for ax, idx in zip(axes, indices):
        ax.imshow(images[idx])
        row = metadata.iloc[idx]
        ax.set_title(
            f"v={row['vertices']}, s={row['size']:.2f}\n"
            f"a={row['angle']:.0f}°",
            fontsize=8
        )
        ax.axis('off')
    
    # 余ったサブプロットを非表示
    for ax in axes[n_samples:]:
        ax.axis('off')
    
    plt.tight_layout()
    plt.show()


def get_statistics(metadata: pd.DataFrame) -> Dict:
    """
    データセットの統計情報を取得
    
    Args:
        metadata: メタデータ DataFrame
    
    Returns:
        統計情報の辞書
    """
    stats = {
        'total_samples': len(metadata),
        'vertices_distribution': metadata['vertices'].value_counts().to_dict(),
        'size': {
            'mean': metadata['size'].mean(),
            'std': metadata['size'].std(),
            'min': metadata['size'].min(),
            'max': metadata['size'].max(),
        },
        'angle': {
            'mean': metadata['angle'].mean(),
            'std': metadata['angle'].std(),
        },
        'center_x': {
            'mean': metadata['center_x'].mean(),
            'std': metadata['center_x'].std(),
        },
        'center_y': {
            'mean': metadata['center_y'].mean(),
            'std': metadata['center_y'].std(),
        },
    }
    return stats


# =============================================================================
# メイン（テスト用）
# =============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Shape Polygons Dataset Loader")
    parser.add_argument("--root", type=str, default="./data", help="Data directory")
    parser.add_argument("--split", type=str, default="train", help="train or test")
    parser.add_argument("--visualize", action="store_true", help="Visualize samples")
    args = parser.parse_args()
    
    # データ読み込み
    print(f"Loading {args.split} split...")
    images, metadata = load_shape_polygons(args.root, args.split, download=False)
    
    print(f"\n=== Dataset Statistics ===")
    print(f"Images shape: {images.shape}")
    print(f"Metadata columns: {metadata.columns.tolist()}")
    
    stats = get_statistics(metadata)
    print(f"\nTotal samples: {stats['total_samples']}")
    print(f"Vertices distribution: {stats['vertices_distribution']}")
    print(f"Size - mean: {stats['size']['mean']:.4f}, std: {stats['size']['std']:.4f}")
    
    if args.visualize:
        print("\nVisualizing samples...")
        visualize_samples(images, metadata, n_samples=16)


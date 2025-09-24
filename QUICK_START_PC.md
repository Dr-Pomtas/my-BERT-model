# 🚀 PC用クイックスタートガイド

## 📥 ファイル取得方法

### 方法1: GitHubから直接ダウンロード
```
1. https://github.com/Dr-Pomtas/my-BERT-model にアクセス
2. 緑色の「Code」ボタンをクリック
3. 「Download ZIP」を選択
4. ダウンロードしたZIPを解凍
```

### 方法2: AI Driveから取得
```
💾 配布用バックアップファイル:
veterinary-analysis-backup-2024-09-24.tar.gz
```

## ⚡ 3ステップで実行

### Step 1: Python環境準備
```bash
# 仮想環境作成
python -m venv vet-analysis
cd vet-analysis

# 環境アクティベート（Windows）
Scripts\activate

# 環境アクティベート（Mac/Linux）  
source bin/activate
```

### Step 2: フル版インストール
```bash
# プロジェクトフォルダに移動
cd path/to/my-BERT-model

# フルBERT版依存関係インストール
pip install -r requirements-full.txt
```

### Step 3: アプリ実行
```bash
# フルBERT版実行
python app-full-bert.py

# ブラウザで http://localhost:5000 を開く
```

## 💡 重要なポイント

### ✅ システム要件
- **Python**: 3.8-3.11
- **RAM**: 8GB以上（推奨16GB）
- **空き容量**: 5GB以上
- **GPU**: CUDA対応（オプション、高速化用）

### ⚠️ よくある問題と解決
```bash
# メモリ不足の場合
export PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512

# GPU使えない場合
# → CPUでも動作します（少し遅くなります）

# モデルダウンロード失敗
# → 初回は時間がかかりますが、インターネット接続を確認
```

### 🔍 動作確認方法
1. ✅ アプリが起動したら http://localhost:5000 にアクセス
2. ✅ サンプルCSVファイル `sample_data.csv` をアップロード
3. ✅ 「分析開始」ボタンをクリック
4. ✅ 散布図とグラフが表示されれば成功

## 📊 フル版の利点

| 項目 | 軽量版 | **フル版** |
|------|--------|------------|
| 感情分析 | ルールベース | **実BERT 3モデル** |
| 精度 | デモレベル | **研究グレード** |
| カスタマイズ | 限定的 | **完全対応** |
| オフライン | ❌ | **✅ 完全オフライン** |

---

**🎯 5分でセットアップ完了！本格的なBERT感情分析をPCで実行できます。**
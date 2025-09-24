# 🏥 動物病院口コミ分析システム - 研究者配布版

## 📦 配布パッケージ内容

### 🎯 2つのバージョンを用意

#### 1. **軽量版（Render対応）** - オンライン共有用
- ✅ **ファイル**: 現在のプロジェクトファイル全体
- ✅ **要件**: `requirements-light.txt`
- ✅ **特徴**: モック分析、軽量、クラウドデプロイ可能
- ✅ **URL**: https://veterinary-bert-analysis.onrender.com

#### 2. **フル機能版（PC専用）** - 研究用
- 🤖 **ファイル**: `app-full-bert.py` + フル要件
- 🤖 **要件**: `requirements-full.txt`
- 🤖 **特徴**: 実際のBERTモデル使用、高精度分析
- 🤖 **環境**: ローカルPC、GPU推奨

## 💻 PCでの実行方法（フル機能版）

### 📋 システム要件

```
🔧 必須要件:
- Python 3.8-3.11
- RAM: 8GB以上（推奨: 16GB）
- ストレージ: 5GB以上の空き容量
- インターネット接続（初回モデルダウンロード用）

⚡ 推奨要件:
- GPU: CUDA対応（NVIDIA）
- VRAM: 4GB以上
- CPU: 8コア以上
```

### 🚀 インストール手順

#### ステップ1: Pythonおよび仮想環境の準備
```bash
# Python仮想環境作成
python -m venv veterinary-analysis-env

# 仮想環境アクティベート
# Windows:
veterinary-analysis-env\Scripts\activate
# macOS/Linux:
source veterinary-analysis-env/bin/activate
```

#### ステップ2: 依存関係インストール
```bash
# フル機能版の依存関係をインストール
pip install --upgrade pip
pip install -r requirements-full.txt

# GPU版PyTorch（CUDA利用可能な場合）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### ステップ3: アプリケーション実行
```bash
# フルBERT版アプリケーション実行
python app-full-bert.py
```

#### ステップ4: アクセス
```
🌐 ブラウザで http://localhost:5000 にアクセス
```

## 📊 機能比較表

| 機能 | 軽量版（Render） | フル機能版（PC） |
|------|------------------|------------------|
| **感情分析** | ルールベース | 実BERT（3モデル） |
| **精度** | デモレベル | 研究グレード |
| **速度** | 高速 | モデル依存 |
| **メモリ** | ~300MB | ~2-4GB |
| **GPU対応** | ❌ | ✅ |
| **デプロイ** | クラウド対応 | ローカル専用 |
| **共同利用** | URL共有 | ファイル配布 |

## 🔬 研究利用のための選択指針

### 📈 軽量版を選ぶ場合
- ✅ プロトタイプ検証
- ✅ システム動作確認
- ✅ 共同研究者との共有
- ✅ 予備実験・概念実証

### 🤖 フル機能版を選ぶ場合
- ✅ 本格的な感情分析研究
- ✅ 高精度な結果が必要
- ✅ 論文・学会発表用データ
- ✅ ベンチマーク・比較研究

## 📁 ファイル配布方法

### 方法1: GitHub経由
```bash
# リポジトリクローン
git clone https://github.com/Dr-Pomtas/my-BERT-model.git
cd my-BERT-model

# フル機能版に切り替え
cp app-full-bert.py app.py
cp requirements-full.txt requirements.txt
```

### 方法2: ZIP配布
```
📦 配布用ZIPファイル作成:
├── veterinary-analysis-full/
│   ├── app-full-bert.py              # フルBERT版メインアプリ
│   ├── requirements-full.txt         # フル依存関係
│   ├── templates/                    # HTMLテンプレート
│   ├── static/                       # CSS/JS/画像
│   ├── sample_data.csv               # サンプルデータ
│   ├── RESEARCHER_GUIDE.md           # 研究者向けガイド
│   └── README_FULL.md                # フル版README
```

### 方法3: AI Drive保存
```
💾 GenSpark AI Drive:
/mnt/aidrive/veterinary-analysis-backup-2024-09-24.tar.gz
```

## 🛠️ トラブルシューティング

### よくある問題

#### 1. **メモリ不足**
```python
# 解決策: バッチサイズ削減
BATCH_SIZE = 1  # app-full-bert.py内で調整
```

#### 2. **GPU認識されない**
```bash
# CUDA確認
python -c "import torch; print(torch.cuda.is_available())"

# GPU用PyTorch再インストール
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### 3. **モデルダウンロード失敗**
```bash
# 手動でキャッシュクリア
rm -rf ~/.cache/huggingface/transformers/

# または環境変数設定
export TRANSFORMERS_CACHE=/path/to/cache
```

#### 4. **パフォーマンス最適化**
```python
# CPU使用時の最適化
import torch
torch.set_num_threads(4)  # CPUスレッド数制限

# GPU使用時の最適化
torch.backends.cudnn.benchmark = True
```

## 📞 サポート・問い合わせ

### 🔧 技術サポート
- **GitHub Issues**: https://github.com/Dr-Pomtas/my-BERT-model/issues
- **ドキュメント**: README.md、各種ガイド参照

### 🤝 研究協力
- **共同研究**: GitHub Discussions
- **改善提案**: Pull Request歓迎
- **データ提供**: Issues経由でご相談

### 📚 引用・クレジット
```bibtex
@software{veterinary_bert_analysis_2024,
  author = {Dr-Pomtas},
  title = {動物病院口コミ分析システム},
  year = {2024},
  url = {https://github.com/Dr-Pomtas/my-BERT-model}
}
```

## 🎯 配布チェックリスト

研究者にファイル配布前の確認事項：

### 📋 ファイル準備
- [ ] `app-full-bert.py` 動作確認済み
- [ ] `requirements-full.txt` 依存関係確認済み
- [ ] サンプルデータ動作確認済み
- [ ] ドキュメント最新版確認済み

### 🧪 動作テスト  
- [ ] CPUでの動作確認
- [ ] GPUでの動作確認（可能な場合）
- [ ] メモリ使用量確認
- [ ] 分析結果の妥当性確認

### 📤 配布準備
- [ ] ZIPファイル作成
- [ ] AI Driveバックアップ
- [ ] 配布先リスト準備
- [ ] サポート体制確認

---

## 🎉 まとめ

**2つの配布オプション**:
1. **オンライン版**: 即座にアクセス可能、共有簡単
2. **ローカル版**: 高精度分析、研究グレード

**研究者への配布**は、研究目的に応じて最適な版を選択して配布してください。

---
*作成日: 2024年9月24日*  
*対象: 動物病院口コミ分析システム研究者配布版*
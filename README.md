# 🏥 動物病院口コミ分析システム

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com/)
[![BERT](https://img.shields.io/badge/BERT-Japanese-orange.svg)](https://huggingface.co/transformers/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.0-purple.svg)](https://getbootstrap.com/)

> 3つの日本語BERTモデルによる動物病院口コミの感情分析システム

## 🎯 概要

本システムは、動物病院の口コミデータを複数の日本語BERTモデルで分析し、感情スコアと星評価の関係を統計的に評価する研究用Webアプリケーションです。

### ✨ 主要機能

- **🤖 マルチモデル分析**: 3つの日本語BERTモデルによる感情分析
- **📊 統計的評価**: ブートストラップ法（10,000回）による信頼区間推定
- **📈 視覚化**: 散布図、円グラフ、性能比較表
- **🔢 正規化処理**: 星評価を-2~+2に正規化
- **📋 CSV対応**: UTF-8 BOM対応の日本語出力

## 🏗️ システム構成

### 使用モデル
1. **cl-tohoku/bert-base-japanese-whole-word-masking** (Koheiduck)
2. **llm-book/bert-base-japanese-v3** (LLM-book)  
3. **Mizuiro-sakura/luke-japanese-base-finetuned-vet** (Mizuiro)

### 技術スタック
- **Backend**: Flask, Transformers, pandas, scipy
- **Frontend**: Bootstrap 5, Plotly.js, Canvas API
- **Analysis**: ブートストラップ統計、相関分析、MAE評価

## 🚀 クイックスタート

### 1. 環境セットアップ
```bash
# リポジトリクローン
git clone https://github.com/Dr-Pomtas/my-BERT-model.git
cd my-BERT-model

# 依存関係インストール
pip install flask transformers torch pandas numpy scipy plotly
```

### 2. アプリケーション起動
```bash
python app.py
```

### 3. アクセス
ブラウザで `http://localhost:5000` にアクセス

## 📁 データフォーマット

### 入力CSV
```csv
hospital_id,review_text,star_rating
1,"とても良い病院でした。先生が優しかったです。",5
2,"待ち時間が長くて困りました。",2
3,"普通の病院だと思います。",3
```

### 出力データ
- 感情スコア（各モデル別）
- 正規化星評価（-2~+2）
- 統計分析結果
- 相関係数・信頼区間

## 📊 分析結果の見方

### 散布図
- **X軸**: 星評価スコア（★1(-2) ~ ★5(+2)）
- **Y軸**: 感情スコア（-2~+2）
- **回帰直線**: モデルの予測精度を示す

### 性能比較表
- **MAE値**: 平均絶対誤差（小さいほど高性能）
- **性能ランク**: 1位/2位/3位
- **評価レベル**: 優秀/良好/標準/要改善

### 統計分析
- **相関係数**: 星評価との相関の強さ
- **95%信頼区間**: ブートストラップ法による推定
- **統計的有意性**: p値による判定

## 🔬 研究応用

### 適用分野
- 動物病院サービス評価分析
- 感情分析モデルの性能比較研究
- 顧客満足度と感情表現の関係分析
- 日本語NLPモデルのベンチマーク

### 統計手法
- **ブートストラップ法**: 10,000回リサンプリング
- **Pearson相関分析**: 星評価と感情スコアの関係
- **MAE比較**: モデル予測精度の定量評価

## 🌐 デプロイメント

### Cloudflare Pages
- **プロジェクト名**: veterinary-bert-analysis
- **自動デプロイ**: GitHub連携
- **永続URL**: 準備中（GitHubリポジトリから直接デプロイ）

### Docker対応
```bash
# 将来的なコンテナ化対応予定
docker build -t veterinary-analysis .
docker run -p 5000:5000 veterinary-analysis
```

## 🛠️ カスタマイズ

### 新しいBERTモデル追加
```python
# app.py内のMODELS辞書に追加
MODELS = {
    'your-model-name': 'Display Name',
    # 既存モデル...
}
```

### UI調整
- `templates/index.html`: HTML構造
- `static/css/style.css`: スタイル
- `static/js/main_targeted.js`: JavaScript機能

## 📈 パフォーマンス

### 処理速度
- **小規模データ** (< 100件): 数秒
- **中規模データ** (< 1000件): 数十秒  
- **大規模データ** (< 10000件): 数分

### システム要件
- **Python**: 3.8以上
- **メモリ**: 4GB以上推奨
- **GPU**: CUDA対応（オプション、高速化）

## 🤝 貢献

### 貢献方法
1. Forkを作成
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

### 課題報告
- GitHubのIssuesを使用
- バグレポート・機能要望歓迎

## 📄 ライセンス

本プロジェクトは研究用途でのみ利用可能です。商用利用については別途ご相談ください。

## 👨‍💻 開発者

**Dr-Pomtas** - [GitHub Profile](https://github.com/Dr-Pomtas)

---

## 🔗 関連リンク

- [Hugging Face Transformers](https://huggingface.co/transformers/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Bootstrap 5](https://getbootstrap.com/)
- [Plotly.js](https://plotly.com/javascript/)

---

**⭐ このプロジェクトが役に立った場合は、GitHubでスターをつけてください！**
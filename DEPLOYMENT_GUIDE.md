# 動物病院口コミ分析システム - 永久保存版

## 📋 プロジェクト概要

本システムは、動物病院の口コミデータを3つの日本語BERTモデルで感情分析する研究用Webアプリケーションです。

### 🎯 主要機能
- **3つの日本語BERTモデル**による感情分析比較
  - cl-tohoku/bert-base-japanese-whole-word-masking (Koheiduck)
  - llm-book/bert-base-japanese-v3 (LLM-book)
  - Mizuiro-sakura/luke-japanese-base-finetuned-vet (Mizuiro)
- **統計的分析**：ブートストラップ法（10,000回）による信頼区間推定
- **視覚化**：散布図、円グラフ、性能比較表
- **正規化処理**：星評価を-2~+2に正規化（★1(-2) ~ ★5(+2)）
- **CSV出力**：UTF-8 BOM対応の日本語テキスト出力

## 🏗️ システム構成

### バックエンド
- **Flask**: Webアプリケーションフレームワーク
- **Transformers**: 日本語BERT感情分析
- **pandas/numpy**: データ処理・統計計算
- **scipy**: 統計検定・相関分析

### フロントエンド
- **Bootstrap 5**: レスポンシブUI
- **Plotly.js**: 散布図・回帰直線
- **Canvas API**: 円グラフ（Chart.js代替）
- **JavaScript**: 非同期処理・データ可視化

## 📊 分析機能詳細

### 1. 感情分析
- **入力**: CSVファイル（hospital_id, review_text, star_rating）
- **処理**: 3つのBERTモデルで感情スコア算出
- **正規化**: 星評価1-5を-2~+2に変換

### 2. 統計分析
- **相関分析**: 星評価と感情スコアのPearson相関
- **ブートストラップ法**: 10,000回リサンプリングによる信頼区間
- **MAE比較**: 平均絶対誤差による性能評価

### 3. 視覚化
- **散布図**: 星評価vs感情スコア（回帰直線付き）
- **円グラフ**: 星評価分布
- **比較表**: モデル性能ランキング

## 🚀 デプロイメント情報

### GitHub Repository
- **URL**: https://github.com/Dr-Pomtas/my-BERT-model
- **ブランチ**: main
- **最終更新**: 2025年9月

### Cloudflare Pages設定
- **プロジェクト名**: veterinary-bert-analysis
- **ビルドコマンド**: なし（静的ファイル）
- **出力ディレクトリ**: /

## 🔧 ローカル実行方法

```bash
# 依存関係インストール
pip install flask transformers torch pandas numpy scipy plotly

# アプリケーション起動
cd /path/to/webapp
python app.py

# アクセス
http://localhost:5000
```

## 📁 重要ファイル

### メインファイル
- `app.py`: Flaskメインアプリケーション
- `templates/index.html`: HTMLテンプレート
- `static/js/main_targeted.js`: JavaScript機能
- `static/css/style.css`: スタイルシート

### データファイル
- `test_data.csv`: サンプルデータ
- `test_debug.csv`: デバッグ用テスト

## 🎨 UI特徴

### 正規化表示の改善
- X軸ラベル: `★1(-2) ~ ★5(+2)` で正規化が一目瞭然
- 軸範囲: X軸・Y軸ともに-2.5~+2.5で統一
- ブートストラップ記述: 全箇所で10,000回に統一

### エラーハンドリング
- Chart.js読み込み失敗時のCanvas代替
- CSV文字化け防止（UTF-8 BOM）
- モバイル対応レスポンシブデザイン

## 📈 研究用途

本システムは以下の研究目的で開発されました：
- 動物病院評価の感情分析精度比較
- 日本語BERTモデルの性能評価
- 口コミテキストと星評価の相関性分析
- ブートストラップ統計による信頼性評価

## 👥 共同研究者向け情報

### アクセス方法
1. **GitHub**: リポジトリをクローンしてローカル実行
2. **Cloudflare Pages**: デプロイ済みWebアプリにアクセス
3. **Docker**: 将来的なコンテナ化対応予定

### データフォーマット
```csv
hospital_id,review_text,star_rating
1,"とても良い病院でした",5
2,"普通でした",3
```

### 出力データ
- CSV形式でのエクスポート機能
- 日本語文字の完全対応
- 統計結果の詳細レポート

## 📞 技術サポート

システムに関する技術的な質問や改善提案がございましたら、
GitHubのIssuesにてお知らせください。

---
**作成日**: 2025年9月24日  
**バージョン**: 1.0.0  
**ライセンス**: 研究用途  
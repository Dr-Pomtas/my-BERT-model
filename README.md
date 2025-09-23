# 動物病院口コミ分析システム

## 概要

本システムは、動物病院の口コミデータを分析し、複数のBERTモデルによる感情分析の性能を比較するための研究支援アプリケーションです。

## 機能

### 1. データアップロード
- CSVファイルのアップロード機能
- データの基本統計量表示（総口コミ数、病院数、平均星評価、星評価分布）

### 2. 感情分析とモデル比較
以下の3つの日本語BERTモデルを使用した感情分析を実行します：
- `koheiduck/bert-japanese-finetuned-sentiment`
- `llm-book/bert-base-japanese-v2-finetuned-sentiment` 
- `Mizuiro-inc/bert-base-japanese-finetuned-sentiment-analysis`

### 3. 結果の可視化
- モデル性能比較（相関係数、平均絶対誤差）
- 散布図による相関関係の可視化
- 結果のCSVエクスポート機能

## データ形式

入力CSVファイルは以下の列を含む必要があります：

- `hospital_id`: 動物病院ID
- `review_text`: 口コミテキスト  
- `star_rating`: 星評価（1-5の整数）

## スコア計算

### 口コミスコア
各モデルで、口コミごとにポジティブ確率 P(pos) とネガティブ確率 P(neg) を計算し、以下の式でスコア化：

```
口コミスコア = (P(pos) × 2) - (P(neg) × 2)
```

### 星評価スコア
星評価を以下の式でスコア化：

```
星評価スコア = 星評価 - 3
```

両スコアとも -2.0 から +2.0 の範囲に正規化されます。

## セットアップ

### 必要なパッケージ

```bash
pip install -r requirements.txt
```

### 実行方法

```bash
python app.py
```

アプリケーションは http://localhost:5000 でアクセスできます。

## サンプルデータ

`sample_data.csv` にテスト用のサンプルデータが含まれています。

## 技術仕様

- **フレームワーク**: Flask
- **フロントエンド**: Bootstrap 5, Chart.js, Plotly.js
- **機械学習**: Transformers, PyTorch
- **データ処理**: Pandas, NumPy
- **可視化**: Plotly, Matplotlib, Seaborn

## 研究目的

本システムは動物病院の経営意識とオンライン評価の関連性を解明するための研究の第一段階（最適な感情分析モデルの選定）を支援します。

## ライセンス

このプロジェクトは研究目的で開発されています。
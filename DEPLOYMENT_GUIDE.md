# 🏥 動物病院口コミ分析システム - デプロイメントガイド

## 🎯 概要
このガイドでは、動物病院口コミ分析システムの保存、復元、デプロイメント方法を説明します。

## 💾 バックアップ・保存方法

### 1. プロジェクト全体のアーカイブ作成
```bash
cd /home/user
tar -czf webapp_backup_$(date +%Y%m%d_%H%M).tar.gz webapp/
```

### 2. AI Driveへの保存
```bash
cp webapp_backup_*.tar.gz /mnt/aidrive/
```

## 🔄 復元・セットアップ方法

### 1. バックアップからの復元
```bash
# AI Driveからコピー
cp /mnt/aidrive/webapp_backup_YYYYMMDD_HHMM.tar.gz /home/user/

# アーカイブを展開
cd /home/user
tar -xzf webapp_backup_YYYYMMDD_HHMM.tar.gz
```

### 2. 依存関係のインストール
```bash
cd /home/user/webapp
pip install flask pandas numpy scikit-learn scipy plotly
```

### 3. アプリケーション起動
```bash
# 方法1: 直接起動
cd /home/user/webapp
python app.py

# 方法2: スクリプト使用
cd /home/user/webapp
./start_server.sh
```

## 🌐 URL取得

アプリ起動後、以下のコマンドで公開URLを取得：
```bash
# GetServiceUrl ツールを使用（Claude環境）
# ポート: 5000
# サービス名: 動物病院口コミ分析システム
```

## 📁 重要なファイル構成

```
webapp/
├── app.py                           # メインFlaskアプリケーション
├── requirements.txt                 # Python依存関係
├── start_server.sh                 # 起動スクリプト
├── flowchart_data_analysis.html    # フローチャート
├── templates/                      # HTMLテンプレート
├── static/                         # CSS/JS/画像ファイル
├── sample_data.csv                 # サンプルデータ
├── 動物病院口コミサンプル.csv        # 日本語サンプルデータ
└── DEPLOYMENT_GUIDE.md             # このガイド
```

## 🔧 システム要件

- Python 3.8+
- Flask 3.1.2+
- pandas, numpy, scikit-learn
- plotly (可視化)
- 16MB以下のCSVファイルサポート

## 📊 機能概要

### データ形式
- `hospital_id`: 動物病院ID
- `review_text`: 口コミテキスト
- `star_rating`: 星評価（1-5）

### 分析モデル
1. Koheiduck BERT
2. LLM-book BERT
3. Mizuiro BERT

### 出力結果
- 相関係数・MAE比較
- 散布図可視化
- CSV結果エクスポート

## 🚨 トラブルシューティング

### モジュールエラーの場合
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### ポート競合の場合
app.pyの最下部を編集：
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # ポート変更
```

### パフォーマンス問題
- CSVファイルサイズを16MB以下に制限
- 大量データの場合はバッチ処理を検討

## 📞 サポート情報

- システム開発者: Claude AI Assistant
- 作成日: 2025-09-24
- バージョン: v1.0
- GitHub: https://github.com/Dr-Pomtas/my-BERT-model

## 📝 更新履歴

- 2025-09-24: 初版作成
- フローチャート追加
- デプロイメントガイド作成
# 🚀 永続ホスティング・デプロイメントガイド

## ⚠️ 重要：一時的デモサイトについて

**現在のデモURL（時間制限あり）**:
- https://5000-idnebihppheec54fx237x-6532622b.e2b.dev
- このURLは一時的なサンドボックス環境です
- 数時間～数日で利用不可になる可能性があります

## 🌟 永続利用方法

### 方法1: ローカル実行（推奨）
```bash
# 1. GitHubからクローン
git clone https://github.com/Dr-Pomtas/my-BERT-model.git
cd my-BERT-model

# 2. Python環境セットアップ
pip install -r requirements.txt

# 3. アプリケーション起動
python app.py

# 4. ブラウザアクセス
http://localhost:5000
```

### 方法2: Docker実行
```bash
# Docker Composeで実行
docker-compose up -d

# または単体で実行
docker build -t veterinary-analysis .
docker run -p 5000:5000 veterinary-analysis
```

### 方法3: クラウドデプロイ

#### A. Heroku デプロイ
```bash
# Heroku CLI必要
heroku create your-app-name
git push heroku main
heroku open
```

#### B. Railway デプロイ
1. [Railway](https://railway.app)にアクセス
2. GitHubリポジトリを接続
3. 自動デプロイ開始

#### C. Render デプロイ  
1. [Render](https://render.com)にアクセス
2. GitHubから新しいWebサービス作成
3. `python app.py`でスタートコマンド設定

#### D. Cloudflare Pages (静的版)
```bash
# 静的版をデプロイ（制限あり）
npx wrangler pages publish static --project-name=veterinary-analysis
```

### 方法4: VPS/自前サーバー
```bash
# Ubuntu/Debianサーバーでの例
sudo apt update
sudo apt install python3 python3-pip git nginx
git clone https://github.com/Dr-Pomtas/my-BERT-model.git
cd my-BERT-model
pip3 install -r requirements.txt

# systemdサービス作成
sudo nano /etc/systemd/system/veterinary-analysis.service

# Nginxリバースプロキシ設定
sudo nano /etc/nginx/sites-available/veterinary-analysis
sudo systemctl enable veterinary-analysis
sudo systemctl start veterinary-analysis
```

## 🎯 共同研究者向け推奨方法

### 🥇 最推奨: ローカル実行
**メリット**:
- ✅ 完全に無料
- ✅ 全機能利用可能  
- ✅ データプライバシー保護
- ✅ カスタマイズ自由

**手順**:
1. Pythonをインストール（3.8以上）
2. GitHubからリポジトリをクローン
3. 依存関係をインストール
4. `python app.py`で起動

### 🥈 次善策: Docker実行
**メリット**:
- ✅ 環境の一貫性
- ✅ 簡単なセットアップ
- ✅ 複数環境での実行

**必要なもの**:
- Docker & Docker Compose

### 🥉 クラウド実行（小規模）
**メリット**:
- ✅ インターネット経由アクセス
- ✅ チーム共有可能
- ✅ メンテナンス不要

**注意**:
- 💰 有料サービスが多い
- 📊 大量データ処理に制限
- 🔒 データプライバシー要考慮

## 💡 各環境の特徴比較

| 方法 | 費用 | 難易度 | 性能 | 共有性 |
|------|------|--------|------|--------|
| ローカル | 無料 | 簡単 | 高 | 低 |
| Docker | 無料 | 中 | 高 | 中 |
| Heroku | 有料 | 簡単 | 中 | 高 |
| Railway | 有料 | 簡単 | 中 | 高 |
| VPS | 有料 | 難 | 高 | 高 |

## 📋 デプロイ時の注意事項

### セキュリティ
- 本番環境では`DEBUG = False`に設定
- 機密データのアップロード注意
- HTTPS使用を推奨

### パフォーマンス
- 大量データ処理時はローカル実行推奨
- BERTモデル読み込みで初回起動時間長い
- GPUがある場合は高速化可能

### データ管理
- アップロードファイルの自動削除設定
- ログローテーション設定
- バックアップ体制構築

## 🆘 トラブルシューティング

### よくある問題

#### 1. 依存関係エラー
```bash
# 解決方法
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

#### 2. Torchインストールエラー  
```bash
# CPU版を明示的にインストール
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

#### 3. メモリ不足
```bash
# 軽量版BERTモデルに変更
# または処理データ量を削減
```

#### 4. ポートエラー
```bash
# app.pyでポート変更
app.run(host='0.0.0.0', port=8080, debug=False)
```

## 📞 サポート

### 技術サポート
- **GitHub Issues**: https://github.com/Dr-Pomtas/my-BERT-model/issues
- **ドキュメント**: README.md参照
- **コミュニティ**: GitHubディスカッション利用

### 研究者向けサポート
- **システム改良**: Pull Request歓迎
- **機能追加**: Issue投稿
- **論文引用**: 自由に利用可能

---

## 🎯 まとめ

**永続利用には以下を推奨**:
1. **個人研究**: ローカル実行
2. **チーム研究**: Docker + VPS
3. **デモ用途**: クラウドサービス

**一時的デモサイトは参考程度にとどめ、本格利用は上記方法をご利用ください。**

---
*最終更新: 2025年9月24日*
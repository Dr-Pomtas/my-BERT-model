# 🚀 Render デプロイメントガイド

## 📋 Renderでの永続デプロイメント手順

### 1. Renderアカウント作成
1. [Render.com](https://render.com) にアクセス
2. GitHubアカウントでサインアップ
3. 無料プランで開始

### 2. 新しいWebサービス作成
1. Renderダッシュボードで **"New +"** をクリック
2. **"Web Service"** を選択
3. **"Connect a repository"** でGitHubを選択

### 3. GitHubリポジトリ接続
1. **Repository**: `Dr-Pomtas/my-BERT-model` を選択
2. **Branch**: `main` を選択
3. **Root Directory**: 空白のまま（ルートディレクトリ使用）

### 4. サービス設定
```
Name: veterinary-bert-analysis
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: gunicorn --config gunicorn.conf.py app:app
```

### 5. 環境変数設定（オプション）
```
PYTHON_VERSION=3.9.16
FLASK_ENV=production
```

### 6. デプロイ実行
1. **"Create Web Service"** をクリック
2. 初回ビルド開始（5-10分程度）
3. デプロイ完了を待つ

## 🔧 設定ファイル詳細

### render.yaml
```yaml
services:
  - type: web
    name: veterinary-bert-analysis
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn --config gunicorn.conf.py app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.16
      - key: FLASK_ENV
        value: production
    healthCheckPath: /
    autoDeploy: true
```

### gunicorn.conf.py
```python
# 本番環境用の高性能WSGI設定
bind = f"0.0.0.0:{os.environ.get('PORT', 5000)}"
workers = 1  # Render free tier
timeout = 30
preload_app = True
```

## 🌟 Renderの利点

### ✅ メリット
- **無料プラン**: 750時間/月まで無料
- **自動デプロイ**: GitHubプッシュで自動更新
- **HTTPS対応**: 自動でSSL証明書設定
- **カスタムドメイン**: 独自ドメイン設定可能
- **ログ監視**: リアルタイムログ表示

### ⚠️ 制限事項
- **スリープ**: 15分間非アクティブで休止
- **CPU制限**: 0.5 CPU、512MB RAM
- **帯域幅**: 100GB/月まで
- **初回起動**: BERTモデル読み込みで時間がかかる

## 🎯 本番運用での推奨事項

### パフォーマンス最適化
```python
# app.pyでキャッシュ機能追加
from functools import lru_cache

@lru_cache(maxsize=3)
def load_model(model_name):
    # モデルキャッシュで高速化
    pass
```

### ヘルスチェック
```python
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': time.time()}
```

### エラーハンドリング
```python
@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Internal server error'}, 500
```

## 📊 期待されるデプロイ結果

### 🌐 永続URL取得
- **形式**: `https://veterinary-bert-analysis.onrender.com`
- **アクセス**: 24時間365日利用可能
- **更新**: GitHubプッシュで自動反映

### 📈 性能特性
- **初回アクセス**: 30-60秒（モデル読み込み）
- **通常レスポンス**: 1-3秒
- **分析処理**: データ量に依存（数秒～数分）

### 🔒 セキュリティ
- **HTTPS**: 自動で有効化
- **CORS**: 適切に設定済み
- **環境変数**: 機密情報の安全な管理

## 🛠️ トラブルシューティング

### よくある問題

#### 1. ビルド失敗
```bash
# 依存関係の問題
pip install --upgrade pip setuptools wheel
```

#### 2. メモリ不足
```python
# モデル軽量化
torch.set_num_threads(1)  # CPU使用量制限
```

#### 3. タイムアウト
```python
# リクエストタイムアウト延長
timeout = 60  # gunicorn.conf.pyで設定
```

#### 4. スリープ対策
```python
# 定期的なヘルスチェック設定
# 外部サービス（UptimeRobot等）で監視
```

## 📞 サポート情報

### Render公式サポート
- **ドキュメント**: https://render.com/docs
- **コミュニティ**: https://community.render.com
- **ステータス**: https://status.render.com

### プロジェクト固有サポート
- **GitHub Issues**: https://github.com/Dr-Pomtas/my-BERT-model/issues
- **技術質問**: GitHubディスカッション
- **改善提案**: Pull Request歓迎

---

## 🎉 デプロイ完了後

**永続URL取得後は以下を更新**:
1. README.mdにURL追加
2. 研究者向け資料更新
3. 共同研究者に新URLを通知

**これで動物病院口コミ分析システムが永続的に利用可能になります！** 🚀

---
*作成日: 2025年9月24日*  
*対象: Render.com無料プラン*
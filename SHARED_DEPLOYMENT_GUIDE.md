# 🏥 動物病院口コミ分析システム - 共同研究者向けデプロイメントガイド

## 🎯 目的
共同研究者が24/7いつでもアプリにアクセスできる永続化デプロイメント

---

## 🚀 **推奨デプロイメント方法（優先順位順）**

### 1. 🔥 **Heroku (最推奨・簡単)**
```bash
# 1. Heroku CLIインストール
# 2. Herokuアカウント作成
# 3. デプロイ実行
heroku create vet-review-analysis-[your-name]
git push heroku main
```

**メリット:**
- ✅ 完全無料（月550時間まで）
- ✅ 自動SSL証明書
- ✅ カスタムドメイン対応
- ✅ ログ監視機能

**アクセス例:** `https://vet-review-analysis-yourname.herokuapp.com`

### 2. 🚂 **Railway (高速・モダン)**
```bash
# 1. Railway.appアカウント作成
# 2. GitHub連携
# 3. プロジェクトデプロイ
railway login
railway link
railway up
```

**メリット:**
- ✅ 月5ドルの無料枠
- ✅ 高速デプロイ（1-2分）
- ✅ 自動HTTPS
- ✅ 環境変数管理

**アクセス例:** `https://vet-review-analysis-production.up.railway.app`

### 3. 🎨 **Render (安定性重視)**
```bash
# 1. Render.comアカウント作成
# 2. GitHub連携
# 3. Web Service作成
# 4. render.yaml使用でワンクリックデプロイ
```

**メリット:**
- ✅ 無料プラン（月750時間）
- ✅ 自動スリープ機能
- ✅ PostgreSQL統合
- ✅ カスタムドメイン

### 4. ☁️ **Google Cloud Run (スケーラブル)**
```bash
# 1. Google Cloudアカウント
# 2. Docker化
# 3. Cloud Runデプロイ
gcloud run deploy --source .
```

**メリット:**
- ✅ 従量課金（使った分だけ）
- ✅ 自動スケーリング
- ✅ 高可用性
- ✅ Google統合

---

## 📋 **ステップバイステップ: Heroku展開**

### **準備作業**
1. **Herokuアカウント作成:** https://heroku.com
2. **Heroku CLI インストール:** https://devcenter.heroku.com/articles/heroku-cli
3. **Gitリポジトリ準備完了** ✅

### **デプロイ手順**
```bash
# 1. Heroku CLIログイン
heroku login

# 2. Herokuアプリ作成
heroku create vet-review-analysis-2024

# 3. 環境変数設定（オプション）
heroku config:set FLASK_ENV=production

# 4. デプロイ実行
git push heroku main

# 5. アプリ起動確認
heroku open
```

### **カスタムドメイン設定（オプション）**
```bash
heroku domains:add your-custom-domain.com
```

---

## 🔧 **設定ファイル説明**

| ファイル | 用途 | プラットフォーム |
|---------|------|----------------|
| `Procfile` | プロセス定義 | Heroku |
| `railway.json` | 設定ファイル | Railway |
| `render.yaml` | サービス定義 | Render |
| `requirements.txt` | Python依存関係 | 全プラットフォーム |

---

## 🌍 **共同研究者向けアクセス情報**

### **パブリックURL例**
```
🔗 Heroku:   https://vet-review-analysis-2024.herokuapp.com
🔗 Railway:  https://vet-review-analysis-production.up.railway.app  
🔗 Render:   https://vet-review-analysis.onrender.com
```

### **機能アクセス**
- **📊 メイン分析:** `/`
- **📈 フローチャート:** `/flowchart_data_analysis.html`
- **📋 サンプルデータ:** 内蔵済み

---

## 👥 **研究チーム向け管理**

### **共同アクセス管理**
```bash
# Herokuの場合
heroku access:add collaborator@email.com
heroku config:set RESEARCH_TEAM="University Lab"
```

### **使用状況監視**
```bash
# ログ確認
heroku logs --tail

# メトリクス確認  
heroku metrics
```

### **アップデート手順**
```bash
# 1. コード更新
git add .
git commit -m "研究機能追加"

# 2. デプロイ
git push heroku main

# 3. 共同研究者に通知
echo "アプリが更新されました: https://your-app.herokuapp.com"
```

---

## 🔒 **セキュリティ設定**

### **本番環境向け設定**
```python
# app.py内で追加推奨
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')
app.config['WTF_CSRF_ENABLED'] = True
```

### **環境変数**
```bash
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set FLASK_ENV="production"  
heroku config:set MAX_UPLOAD_SIZE="16777216"  # 16MB
```

---

## 📊 **コスト比較**

| プラットフォーム | 無料枠 | 有料プラン | 推奨用途 |
|---------------|--------|-----------|---------|
| **Heroku** | 550時間/月 | $7/月〜 | 研究プロトタイプ |
| **Railway** | $5クレジット/月 | $5/月〜 | 継続使用 |
| **Render** | 750時間/月 | $7/月〜 | 安定運用 |
| **Vercel** | 100GB帯域 | $20/月〜 | 高速配信 |

---

## 🎯 **最終推奨**

### **研究用途なら Heroku**
- 🎓 学術利用に最適
- 📚 豊富なドキュメント
- 🆓 十分な無料枠
- 🔧 簡単管理

### **本格運用なら Railway**  
- ⚡ 高速・安定
- 🔄 自動デプロイ
- 📈 スケーラブル
- 💰 コスパ良好

---

## 📞 **サポート連絡先**

- **開発者:** Claude AI Assistant
- **GitHub:** https://github.com/Dr-Pomtas/my-BERT-model
- **技術文書:** `DEPLOYMENT_GUIDE.md`
- **作成日:** 2025-09-24

**🎉 これで共同研究者全員が24時間365日アクセス可能です！**
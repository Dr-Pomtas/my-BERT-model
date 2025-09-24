#!/bin/bash
# 動物病院口コミ分析システム起動スクリプト

echo "🏥 動物病院口コミ分析システムを起動中..."

# 作業ディレクトリに移動
cd /home/user/webapp

# 仮想環境がある場合はアクティベート（オプション）
# source venv/bin/activate

# 必要なパッケージの確認とインストール
echo "📦 必要なパッケージを確認中..."
pip install flask pandas numpy scikit-learn scipy plotly > /dev/null 2>&1

# Flaskアプリケーション起動
echo "🚀 Flaskアプリケーションを起動中..."
echo "📍 URL: http://0.0.0.0:5000"
echo "🔧 デバッグモード: ON"
echo "⏹️  停止するには Ctrl+C を押してください"
echo ""

python app.py
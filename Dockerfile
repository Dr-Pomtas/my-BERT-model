# 動物病院口コミ分析システム - Docker設定

FROM python:3.9-slim

# 作業ディレクトリ設定
WORKDIR /app

# システム依存関係インストール
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係インストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションファイルコピー
COPY . .

# ポート公開
EXPOSE 5000

# 環境変数設定
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# アプリケーション起動
CMD ["python", "app.py"]
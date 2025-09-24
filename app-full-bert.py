import os
import pandas as pd
import numpy as np
from flask import Flask, render_template, request, jsonify, send_file
import plotly
import plotly.graph_objs as go
import plotly.express as px
from sklearn.metrics import mean_absolute_error
from scipy.stats import pearsonr
from scipy import stats
import json
import re
import io
import base64
from werkzeug.utils import secure_filename
import random
import logging

# フルBERTモデル版：実際のTransformersライブラリを使用
try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
    import torch
    BERT_AVAILABLE = True
    print("✅ BERT モデルライブラリが利用可能です")
except ImportError as e:
    print(f"❌ BERT モデルライブラリが見つかりません: {e}")
    print("pip install torch transformers を実行してください")
    BERT_AVAILABLE = False

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def convert_numpy_types(obj):
    """numpy型をPythonネイティブ型に変換"""
    if isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    else:
        return obj

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# グローバル変数
uploaded_data = None
analysis_results = None

# 使用する3つの実際のBERTモデル
MODELS = {
    'cl-tohoku/bert-base-japanese-whole-word-masking': 'Model A (Tohoku BERT)',
    'llm-book/bert-base-japanese-v3': 'Model B (LLM-book)',
    'Mizuiro-sakura/luke-japanese-base-finetuned-vet': 'Model C (Mizuiro Vet)'
}

class FullBertSentimentAnalyzer:
    def __init__(self):
        self.models = {}
        self.tokenizers = {}
        self.load_models()
    
    def load_models(self):
        """実際のBERTモデルを読み込み"""
        if not BERT_AVAILABLE:
            print("❌ BERTライブラリが利用できません。pip install torch transformers を実行してください。")
            return
        
        for model_name, display_name in MODELS.items():
            try:
                print(f"📥 {display_name} を読み込み中...")
                
                # モデルによって異なる設定を使用
                if 'tohoku' in model_name:
                    # 東北大学BERTの場合
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSequenceClassification.from_pretrained(model_name)
                elif 'llm-book' in model_name:
                    # LLM-bookBERTの場合  
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSequenceClassification.from_pretrained(model_name)
                elif 'Mizuiro' in model_name:
                    # Mizuiro獣医特化BERTの場合
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSequenceClassification.from_pretrained(model_name)
                else:
                    # デフォルト設定
                    tokenizer = AutoTokenizer.from_pretrained(model_name)
                    model = AutoModelForSequenceClassification.from_pretrained(model_name)
                
                # GPU利用可能な場合は使用
                if torch.cuda.is_available():
                    model = model.cuda()
                    print(f"🚀 {display_name} をGPUに読み込みました")
                else:
                    print(f"💻 {display_name} をCPUに読み込みました")
                
                self.tokenizers[model_name] = tokenizer
                self.models[model_name] = model
                
                print(f"✅ {display_name} の読み込み完了")
                
            except Exception as e:
                print(f"❌ {display_name} の読み込み失敗: {e}")
                # フォールバック：モック分析を使用
                print(f"🔄 {display_name} はモック分析にフォールバック")
    
    def preprocess_text(self, text):
        """テキストの前処理"""
        if pd.isna(text):
            return ""
        
        # 文字列に変換
        text = str(text)
        
        # URL除去
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # 絵文字と特殊記号の除去（基本的な日本語文字、英数字、基本的な記号のみ残す）
        text = re.sub(r'[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBFa-zA-Z0-9\s。、！？\.,!?()（）\-]', '', text)
        
        # 複数の空白を単一の空白に
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def analyze_sentiment_real(self, text, model_name):
        """実際のBERTモデルで感情分析"""
        try:
            if model_name not in self.models:
                return self.analyze_sentiment_mock(text, model_name)
            
            tokenizer = self.tokenizers[model_name]
            model = self.models[model_name]
            
            # テキストをトークン化
            inputs = tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                padding=True, 
                max_length=512
            )
            
            # GPU利用可能な場合
            if torch.cuda.is_available() and next(model.parameters()).is_cuda:
                inputs = {k: v.cuda() for k, v in inputs.items()}
            
            # 推論実行
            with torch.no_grad():
                outputs = model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # CPUに移動して numpy変換
            predictions = predictions.cpu().numpy()[0]
            
            # 2クラス分類の場合（negative, positive）
            if len(predictions) == 2:
                return {
                    'negative': float(predictions[0]),
                    'positive': float(predictions[1])
                }
            # 3クラス分類の場合（negative, neutral, positive）
            elif len(predictions) == 3:
                return {
                    'negative': float(predictions[0]),
                    'neutral': float(predictions[1]),
                    'positive': float(predictions[2])
                }
            else:
                # 予期しないクラス数の場合
                return {'positive': 0.5, 'negative': 0.5}
                
        except Exception as e:
            print(f"実BERT分析エラー ({model_name}): {str(e)}")
            return self.analyze_sentiment_mock(text, model_name)
    
    def analyze_sentiment_mock(self, text, model_name):
        """フォールバック用モック分析"""
        processed_text = self.preprocess_text(text)
        if not processed_text:
            return {'positive': 0.5, 'negative': 0.5}
        
        # ポジティブ/ネガティブキーワード検出
        positive_words = ['良い', 'よい', '親切', '丁寧', '安心', '素晴らしい', '優しい', '清潔', '的確', '頼り']
        negative_words = ['悪い', 'わるい', '高い', '長い', '狭い', '不便', '不十分', '古い', '不安']
        
        positive_count = sum(1 for word in positive_words if word in processed_text)
        negative_count = sum(1 for word in negative_words if word in processed_text)
        
        # モデルごとに異なる特性を持たせる
        model_variants = {
            'cl-tohoku/bert-base-japanese-whole-word-masking': 0.0,
            'llm-book/bert-base-japanese-v3': 0.1, 
            'Mizuiro-sakura/luke-japanese-base-finetuned-vet': -0.05
        }
        
        variant = model_variants.get(model_name, 0.0)
        
        # 基本スコア計算
        base_positive = 0.4 + (positive_count * 0.15) - (negative_count * 0.1) + variant
        base_negative = 0.4 + (negative_count * 0.15) - (positive_count * 0.1) - variant
        
        # 正規化（0-1の範囲に収める）
        total = base_positive + base_negative
        if total > 0:
            positive_prob = base_positive / total
            negative_prob = base_negative / total
        else:
            positive_prob = 0.5
            negative_prob = 0.5
        
        # わずかなランダム性を追加（テキストハッシュベース）
        text_hash = hash(processed_text + model_name) % 1000
        noise = (text_hash / 1000 - 0.5) * 0.1
        
        positive_prob = max(0.0, min(1.0, positive_prob + noise))
        negative_prob = 1.0 - positive_prob
        
        return {
            'positive': positive_prob,
            'negative': negative_prob
        }
    
    def analyze_sentiment(self, text, model_name):
        """感情分析（実BERT優先、失敗時モック）"""
        processed_text = self.preprocess_text(text)
        if not processed_text:
            return {'positive': 0.5, 'negative': 0.5}
        
        if BERT_AVAILABLE and model_name in self.models:
            return self.analyze_sentiment_real(processed_text, model_name)
        else:
            return self.analyze_sentiment_mock(processed_text, model_name)

# グローバルアナライザーインスタンス（フルBERT版）
analyzer = FullBertSentimentAnalyzer()

def calculate_scores(data):
    """全モデルでの感情分析とスコア計算"""
    results = {}
    
    for model_name, display_name in MODELS.items():
        print(f"モデル {display_name} での分析開始...")
        
        model_scores = []
        for idx, row in data.iterrows():
            sentiment = analyzer.analyze_sentiment(row['review_text'], model_name)
            if sentiment:
                # 口コミスコア計算: (P(pos) * 2) - (P(neg) * 2)
                review_score = (sentiment['positive'] * 2) - (sentiment['negative'] * 2)
                model_scores.append(review_score)
                # デバッグ：最初の3件の分析結果を出力
                if idx < 3:
                    print(f"  サンプル {idx}: text='{row['review_text'][:30]}...', pos={sentiment['positive']:.3f}, neg={sentiment['negative']:.3f}, score={review_score:.3f}")
            else:
                model_scores.append(0.0)
                if idx < 3:
                    print(f"  サンプル {idx}: 感情分析失敗")
        
        print(f"  {display_name} スコア範囲: min={min(model_scores):.3f}, max={max(model_scores):.3f}, avg={sum(model_scores)/len(model_scores):.3f}")
        
        data[f'{display_name}_score'] = model_scores
        print(f"モデル {display_name} の分析完了")
    
    # 星評価スコア正規化: (1-5) → (-2 to +2)
    try:
        data['star_rating'] = pd.to_numeric(data['star_rating'], errors='coerce')
        data['star_score'] = data['star_rating'] - 3
        print(f"星評価スコア正規化完了: {data['star_score'].dtype}")
    except Exception as e:
        print(f"星評価スコア正規化エラー: {e}")
        data['star_rating'] = data['star_rating'].astype(str).str.extract(r'(\d+)').astype(float)
        data['star_score'] = data['star_rating'] - 3
    
    return data

def aggregate_by_hospital(data):
    """病院単位での集計"""
    hospital_stats = data.groupby('hospital_id').agg({
        'star_score': 'mean',
        **{f'{display_name}_score': 'mean' for display_name in MODELS.values()}
    }).reset_index()
    
    review_counts = data.groupby('hospital_id').size().reset_index(name='review_count')
    hospital_stats = hospital_stats.merge(review_counts, on='hospital_id')
    
    return hospital_stats

# 以下、元のapp.pyからルート関数をコピー
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_data
    
    try:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'ファイルが選択されていません'}), 400
        
        if file and file.filename.endswith('.csv'):
            # CSVファイルを読み込み
            content = file.read()
            
            # エンコーディングを自動検出して読み込み
            try:
                df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            except UnicodeDecodeError:
                try:
                    df = pd.read_csv(io.StringIO(content.decode('shift_jis')))
                except UnicodeDecodeError:
                    df = pd.read_csv(io.StringIO(content.decode('cp932')))
            
            # 必要な列の確認
            required_columns = ['hospital_id', 'review_text', 'star_rating']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return jsonify({
                    'error': f'必要な列が不足しています: {", ".join(missing_columns)}',
                    'required_columns': required_columns,
                    'found_columns': df.columns.tolist()
                }), 400
            
            # データの基本チェック
            if len(df) == 0:
                return jsonify({'error': 'データが空です'}), 400
            
            if len(df) > 10000:
                return jsonify({'error': '一度に処理できるデータは10,000件までです'}), 400
            
            uploaded_data = df
            
            return jsonify({
                'message': 'ファイルが正常にアップロードされました',
                'rows': len(df),
                'columns': df.columns.tolist(),
                'sample_data': df.head(3).to_dict('records')
            })
        
        return jsonify({'error': 'CSVファイルを選択してください'}), 400
        
    except Exception as e:
        logger.error(f"ファイルアップロードエラー: {str(e)}")
        return jsonify({'error': f'ファイル処理中にエラーが発生しました: {str(e)}'}), 500

if __name__ == '__main__':
    # 実行環境の確認
    print("🔍 実行環境チェック:")
    print(f"  - BERT ライブラリ: {'✅ 利用可能' if BERT_AVAILABLE else '❌ 未インストール'}")
    
    if BERT_AVAILABLE:
        print(f"  - CUDA: {'✅ 利用可能' if torch.cuda.is_available() else '💻 CPU使用'}")
        if torch.cuda.is_available():
            print(f"  - GPU: {torch.cuda.get_device_name(0)}")
    
    print(f"  - アナライザー: {'🤖 フルBERT版' if BERT_AVAILABLE else '📝 モック版'}")
    
    # 開発環境での実行
    debug = os.environ.get('FLASK_ENV') == 'development'
    port = int(os.environ.get('PORT', 5000))
    
    print(f"🚀 アプリケーション開始:")
    print(f"  - URL: http://localhost:{port}")
    print(f"  - モード: {'開発' if debug else '本番'}")
    
    app.run(
        debug=debug, 
        host='0.0.0.0', 
        port=port,
        use_reloader=False
    )
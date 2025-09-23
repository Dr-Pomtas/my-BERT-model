import os
import pandas as pd
import numpy as np
from flask import Flask, render_template, request, jsonify, send_file
import plotly
import plotly.graph_objs as go
import plotly.express as px
from sklearn.metrics import mean_absolute_error
from scipy.stats import pearsonr
import json
import re
import io
import base64
from werkzeug.utils import secure_filename
import random

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# グローバル変数
uploaded_data = None
analysis_results = None

# 使用する3つのモデル
MODELS = {
    'koheiduck/bert-japanese-finetuned-sentiment': 'Model A (Koheiduck)',
    'llm-book/bert-base-japanese-v2-finetuned-sentiment': 'Model B (LLM-book)', 
    'Mizuiro-inc/bert-base-japanese-finetuned-sentiment-analysis': 'Model C (Mizuiro)'
}

class SentimentAnalyzer:
    def __init__(self):
        self.models = {}
        # モック用のシード設定（再現可能な結果のため）
        np.random.seed(42)
        random.seed(42)
    
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
    
    def analyze_sentiment(self, text, model_name):
        """感情分析をモック実行（デモ用）"""
        # テキストの前処理
        processed_text = self.preprocess_text(text)
        if not processed_text:
            return {'positive': 0.5, 'negative': 0.5}
        
        try:
            # テキストの長さとキーワードに基づいたモック感情分析
            text_len = len(processed_text)
            
            # ポジティブ/ネガティブキーワード検出
            positive_words = ['良い', 'よい', '親切', '丁寧', '安心', '素晴らしい', '優しい', '清潔', '的確', '頼り']
            negative_words = ['悪い', 'わるい', '高い', '長い', '狭い', '不便', '不十分', '古い', '不安']
            
            positive_count = sum(1 for word in positive_words if word in processed_text)
            negative_count = sum(1 for word in negative_words if word in processed_text)
            
            # モデルごとに異なる特性を持たせる
            model_variants = {
                'koheiduck/bert-japanese-finetuned-sentiment': 0.0,
                'llm-book/bert-base-japanese-v2-finetuned-sentiment': 0.1, 
                'Mizuiro-inc/bert-base-japanese-finetuned-sentiment-analysis': -0.05
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
            
        except Exception as e:
            print(f"感情分析エラー ({model_name}): {str(e)}")
            return {'positive': 0.5, 'negative': 0.5}

# グローバルアナライザーインスタンス
analyzer = SentimentAnalyzer()

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
            else:
                model_scores.append(0.0)
        
        data[f'{display_name}_score'] = model_scores
        print(f"モデル {display_name} の分析完了")
    
    # 星評価スコア計算: 星評価 - 3
    data['star_score'] = data['star_rating'] - 3
    
    return data

def aggregate_by_hospital(data):
    """病院単位での集計"""
    # 病院IDごとにグループ化して平均を計算
    hospital_stats = data.groupby('hospital_id').agg({
        'star_score': 'mean',
        **{f'{display_name}_score': 'mean' for display_name in MODELS.values()}
    }).reset_index()
    
    # 各病院の口コミ数も追加
    review_counts = data.groupby('hospital_id').size().reset_index(name='review_count')
    hospital_stats = hospital_stats.merge(review_counts, on='hospital_id')
    
    return hospital_stats

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_data
    
    if 'file' not in request.files:
        return jsonify({'error': 'ファイルが選択されていません'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'ファイルが選択されていません'}), 400
    
    if file and file.filename.endswith('.csv'):
        try:
            # CSVファイルを読み込み
            df = pd.read_csv(file)
            
            # 必要な列があるかチェック
            required_columns = ['hospital_id', 'review_text', 'star_rating']
            if not all(col in df.columns for col in required_columns):
                return jsonify({'error': f'必要な列が不足しています: {required_columns}'}), 400
            
            # データ型チェック
            df['star_rating'] = pd.to_numeric(df['star_rating'], errors='coerce')
            df = df.dropna(subset=['star_rating'])
            df['star_rating'] = df['star_rating'].astype(int)
            
            # 1-5の範囲チェック
            df = df[(df['star_rating'] >= 1) & (df['star_rating'] <= 5)]
            
            uploaded_data = df
            
            # 基本統計量計算
            stats = {
                'total_reviews': len(df),
                'unique_hospitals': df['hospital_id'].nunique(),
                'avg_star_rating': float(df['star_rating'].mean()),
                'star_distribution': df['star_rating'].value_counts().sort_index().to_dict()
            }
            
            return jsonify({'success': True, 'stats': stats})
            
        except Exception as e:
            return jsonify({'error': f'ファイル処理エラー: {str(e)}'}), 500
    
    return jsonify({'error': '無効なファイル形式です。CSVファイルをアップロードしてください'}), 400

@app.route('/analyze', methods=['POST'])
def analyze():
    global uploaded_data, analysis_results
    
    if uploaded_data is None:
        return jsonify({'error': 'データがアップロードされていません'}), 400
    
    try:
        # 感情分析とスコア計算
        scored_data = calculate_scores(uploaded_data.copy())
        
        # 病院単位で集計
        hospital_stats = aggregate_by_hospital(scored_data)
        
        # モデル性能評価
        performance_metrics = {}
        
        for model_name, display_name in MODELS.items():
            model_col = f'{display_name}_score'
            
            # 相関係数計算
            correlation, p_value = pearsonr(hospital_stats['star_score'], hospital_stats[model_col])
            
            # MAE計算
            mae = mean_absolute_error(hospital_stats['star_score'], hospital_stats[model_col])
            
            performance_metrics[display_name] = {
                'correlation': float(correlation),
                'p_value': float(p_value),
                'mae': float(mae)
            }
        
        analysis_results = {
            'hospital_stats': hospital_stats,
            'performance_metrics': performance_metrics,
            'scored_data': scored_data
        }
        
        return jsonify({
            'success': True,
            'performance_metrics': performance_metrics,
            'hospital_count': len(hospital_stats)
        })
        
    except Exception as e:
        return jsonify({'error': f'分析エラー: {str(e)}'}), 500

@app.route('/get_charts')
def get_charts():
    global analysis_results
    
    if analysis_results is None:
        return jsonify({'error': '分析結果がありません'}), 400
    
    try:
        hospital_stats = analysis_results['hospital_stats']
        performance_metrics = analysis_results['performance_metrics']
        
        # 1. パフォーマンス比較棒グラフ（相関係数）
        models = list(performance_metrics.keys())
        correlations = [performance_metrics[model]['correlation'] for model in models]
        
        correlation_chart = go.Figure(data=[
            go.Bar(x=models, y=correlations, name='相関係数')
        ])
        correlation_chart.update_layout(
            title='モデル性能比較: 相関係数',
            xaxis_title='モデル',
            yaxis_title='ピアソン相関係数',
            showlegend=False
        )
        
        # 2. MAE比較棒グラフ
        mae_values = [performance_metrics[model]['mae'] for model in models]
        
        mae_chart = go.Figure(data=[
            go.Bar(x=models, y=mae_values, name='MAE', marker_color='orange')
        ])
        mae_chart.update_layout(
            title='モデル性能比較: 平均絶対誤差 (MAE)',
            xaxis_title='モデル',
            yaxis_title='平均絶対誤差',
            showlegend=False
        )
        
        # 3. 散布図（各モデル）
        scatter_charts = []
        
        for model_name, display_name in MODELS.items():
            model_col = f'{display_name}_score'
            correlation = performance_metrics[display_name]['correlation']
            
            scatter_chart = go.Figure(data=go.Scatter(
                x=hospital_stats[model_col],
                y=hospital_stats['star_score'],
                mode='markers',
                marker=dict(size=8, opacity=0.6),
                text=[f'病院ID: {hid}' for hid in hospital_stats['hospital_id']],
                hovertemplate='<b>%{text}</b><br>口コミスコア: %{x:.2f}<br>星評価スコア: %{y:.2f}<extra></extra>'
            ))
            
            scatter_chart.update_layout(
                title=f'{display_name}<br>相関係数 r = {correlation:.3f}',
                xaxis_title='平均口コミスコア',
                yaxis_title='平均星評価スコア'
            )
            
            scatter_charts.append(scatter_chart)
        
        # チャートをJSONに変換
        charts_json = {
            'correlation_chart': json.dumps(correlation_chart, cls=plotly.utils.PlotlyJSONEncoder),
            'mae_chart': json.dumps(mae_chart, cls=plotly.utils.PlotlyJSONEncoder),
            'scatter_charts': [json.dumps(chart, cls=plotly.utils.PlotlyJSONEncoder) for chart in scatter_charts]
        }
        
        return jsonify(charts_json)
        
    except Exception as e:
        return jsonify({'error': f'チャート生成エラー: {str(e)}'}), 500

@app.route('/export_results')
def export_results():
    global analysis_results
    
    if analysis_results is None:
        return jsonify({'error': '分析結果がありません'}), 400
    
    try:
        hospital_stats = analysis_results['hospital_stats']
        
        # CSVファイルを作成
        output = io.StringIO()
        hospital_stats.to_csv(output, index=False, encoding='utf-8')
        output.seek(0)
        
        # レスポンス作成
        return app.response_class(
            output.getvalue(),
            mimetype='text/csv',
            headers={"Content-disposition": "attachment; filename=analysis_results.csv"}
        )
        
    except Exception as e:
        return jsonify({'error': f'エクスポートエラー: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
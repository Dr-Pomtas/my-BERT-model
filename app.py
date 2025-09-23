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
            total_reviews = len(df)
            unique_hospitals = df['hospital_id'].nunique()
            avg_star_rating = float(df['star_rating'].mean())
            star_distribution = df['star_rating'].value_counts().sort_index().to_dict()
            
            print(f"データ統計: 総口コミ数={total_reviews}, 病院数={unique_hospitals}, 平均星評価={avg_star_rating:.2f}")
            print(f"病院ID一覧: {df['hospital_id'].unique().tolist()}")
            
            stats = {
                'total_reviews': total_reviews,
                'unique_hospitals': unique_hospitals,
                'avg_star_rating': avg_star_rating,
                'star_distribution': star_distribution
            }
            
            return jsonify({'success': True, 'stats': stats})
            
        except Exception as e:
            return jsonify({'error': f'ファイル処理エラー: {str(e)}'}), 500
    
    return jsonify({'error': '無効なファイル形式です。CSVファイルをアップロードしてください'}), 400

@app.route('/analyze', methods=['POST'])
def analyze():
    global analysis_results
    
    # リクエストからデータを取得
    request_data = request.get_json()
    if not request_data or 'data' not in request_data:
        return jsonify({'error': 'データが送信されていません'}), 400
    
    # アップロードされたデータをDataFrameに変換
    uploaded_data = pd.DataFrame(request_data['data'])
    
    try:
        # 感情分析とスコア計算
        scored_data = calculate_scores(uploaded_data.copy())
        
        # 病院単位で集計
        hospital_stats = aggregate_by_hospital(scored_data)
        
        print(f"集計後の病院数: {len(hospital_stats)}")
        print(f"集計データのサンプル:")
        print(hospital_stats.head())
        
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
        
        # 星評価分布の計算
        star_distribution = uploaded_data['star_rating'].value_counts().sort_index().to_dict()
        
        # 相関行列の計算
        correlation_matrix = {}
        model_names = list(MODELS.values())
        
        for i, model1 in enumerate(model_names):
            correlation_matrix[model1] = {}
            for j, model2 in enumerate(model_names):
                if i == j:
                    correlation_matrix[model1][model2] = 1.0
                else:
                    col1 = f'{model1}_score'
                    col2 = f'{model2}_score'
                    if col1 in hospital_stats.columns and col2 in hospital_stats.columns:
                        corr, _ = pearsonr(hospital_stats[col1], hospital_stats[col2])
                        correlation_matrix[model1][model2] = float(corr)
                    else:
                        correlation_matrix[model1][model2] = 0.0
        
        # 基本統計の計算
        basic_stats = {
            'total_reviews': len(uploaded_data),
            'unique_hospitals': len(hospital_stats),
            'avg_rating': float(uploaded_data['star_rating'].mean()),
            'avg_review_length': float(uploaded_data['review_text'].str.len().mean())
        }
        
        # 病院別分析データ
        hospital_analysis = {}
        for _, row in hospital_stats.iterrows():
            hospital_id = row['hospital_id']
            hospital_analysis[hospital_id] = {
                'review_count': int(row['review_count']),
                'avg_rating': float(uploaded_data[uploaded_data['hospital_id'] == hospital_id]['star_rating'].mean()),
                'avg_sentiment': float(row[[col for col in hospital_stats.columns if col.endswith('_score')]].mean())
            }
        
        analysis_results = {
            'hospital_stats': hospital_stats,
            'performance_metrics': performance_metrics,
            'scored_data': scored_data
        }
        
        # JavaScriptが期待する形式でレスポンスを返す
        return jsonify({
            'success': True,
            'results': {
                'basic_stats': basic_stats,
                'model_comparison': performance_metrics,
                'star_rating_distribution': star_distribution,
                'correlation_matrix': correlation_matrix,
                'hospital_analysis': hospital_analysis
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'分析エラー: {str(e)}'}), 500

def bootstrap_correlation_ci(x_data, y_data, n_bootstrap=10000, confidence_level=0.95):
    """ブートストラップ法で相関係数の信頼区間を計算"""
    n = len(x_data)
    bootstrap_correlations = []
    
    for _ in range(n_bootstrap):
        # リサンプリング
        indices = np.random.choice(n, n, replace=True)
        x_boot = [x_data[i] for i in indices]
        y_boot = [y_data[i] for i in indices]
        
        # 相関係数計算
        if len(set(x_boot)) > 1 and len(set(y_boot)) > 1:  # 分散が0でない場合のみ
            corr, _ = pearsonr(x_boot, y_boot)
            if not np.isnan(corr):
                bootstrap_correlations.append(corr)
    
    # 信頼区間計算
    alpha = 1 - confidence_level
    lower_percentile = (alpha / 2) * 100
    upper_percentile = (1 - alpha / 2) * 100
    
    ci_lower = np.percentile(bootstrap_correlations, lower_percentile)
    ci_upper = np.percentile(bootstrap_correlations, upper_percentile)
    
    return ci_lower, ci_upper, bootstrap_correlations

def bootstrap_mae_difference_test(y_true, y_pred1, y_pred2, n_bootstrap=10000, confidence_level=0.95):
    """ブートストラップ法でMAE差の信頼区間を計算"""
    n = len(y_true)
    mae_differences = []
    
    print(f"統計検定開始: モデル1 vs モデル2")
    print(f"データ数: {n}")
    
    # オリジナルのMAE計算
    original_mae1 = mean_absolute_error(y_true, y_pred1)
    original_mae2 = mean_absolute_error(y_true, y_pred2)
    print(f"オリジナルMAE: モデル1={original_mae1:.4f}, モデル2={original_mae2:.4f}")
    
    for i in range(n_bootstrap):
        # 進行状況表示（1000回ごと）
        if (i + 1) % 1000 == 0:
            print(f"ブートストラップ進捗: {i+1}/{n_bootstrap}")
            
        # リサンプリング
        indices = np.random.choice(n, n, replace=True)
        y_true_boot = [y_true[i] for i in indices]
        y_pred1_boot = [y_pred1[i] for i in indices]
        y_pred2_boot = [y_pred2[i] for i in indices]
        
        # MAE計算
        mae1 = mean_absolute_error(y_true_boot, y_pred1_boot)
        mae2 = mean_absolute_error(y_true_boot, y_pred2_boot)
        
        # MAE差を記録 (モデル2のMAE - モデル1のMAE)
        mae_differences.append(mae2 - mae1)
    
    # 信頼区間計算
    alpha = 1 - confidence_level
    lower_percentile = (alpha / 2) * 100
    upper_percentile = (1 - alpha / 2) * 100
    
    ci_lower = np.percentile(mae_differences, lower_percentile)
    ci_upper = np.percentile(mae_differences, upper_percentile)
    
    print(f"95%信頼区間: [{ci_lower:.4f}, {ci_upper:.4f}]")
    
    return ci_lower, ci_upper, mae_differences

@app.route('/get_charts')
def get_charts():
    global analysis_results
    
    if analysis_results is None:
        return jsonify({'error': '分析結果がありません'}), 400
    
    try:
        hospital_stats = analysis_results['hospital_stats']
        performance_metrics = analysis_results['performance_metrics']
        
        # 1. パフォーマンス比較棒グラフ（相関係数）- 信頼区間付き
        models = list(performance_metrics.keys())
        correlations = []
        correlation_cis = []
        
        for model in models:
            model_col = f'{model}_score'
            x_data = hospital_stats[model_col].tolist()
            y_data = hospital_stats['star_score'].tolist()
            
            # 相関係数の信頼区間を計算
            ci_lower, ci_upper, _ = bootstrap_correlation_ci(x_data, y_data)
            correlation_cis.append((ci_lower, ci_upper))
            correlations.append(performance_metrics[model]['correlation'])
        
        # エラーバー付きの相関係数グラフ
        correlation_chart = go.Figure(data=[
            go.Bar(
                x=models, 
                y=correlations, 
                name='相関係数',
                error_y=dict(
                    type='data',
                    symmetric=False,
                    array=[ci[1] - corr for ci, corr in zip(correlation_cis, correlations)],
                    arrayminus=[corr - ci[0] for ci, corr in zip(correlation_cis, correlations)]
                )
            )
        ])
        correlation_chart.update_layout(
            title='モデル性能比較: 相関係数 (95%信頼区間付き)',
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
        
        # 3. 散布図（各モデル）- 信頼区間情報付き
        scatter_charts = []
        
        for i, (model_name, display_name) in enumerate(MODELS.items()):
            model_col = f'{display_name}_score'
            correlation = performance_metrics[display_name]['correlation']
            ci_lower, ci_upper = correlation_cis[i]
            
            # データをリストに変換して確実にプロット
            x_data = hospital_stats[model_col].tolist()
            y_data = hospital_stats['star_score'].tolist()
            hospital_ids = hospital_stats['hospital_id'].tolist()
            
            scatter_chart = go.Figure()
            
            scatter_chart.add_trace(go.Scatter(
                x=x_data,
                y=y_data,
                mode='markers',
                marker=dict(
                    size=10, 
                    opacity=0.7,
                    color='blue',
                    line=dict(width=1, color='darkblue')
                ),
                text=[f'病院ID: {hid}' for hid in hospital_ids],
                hovertemplate='<b>%{text}</b><br>口コミスコア: %{x:.3f}<br>星評価スコア: %{y:.3f}<extra></extra>',
                name='病院データ'
            ))
            
            # 回帰線を追加
            if len(x_data) > 1:
                slope, intercept, r_value, p_value, std_err = stats.linregress(x_data, y_data)
                x_line = [min(x_data), max(x_data)]
                y_line = [slope * x + intercept for x in x_line]
                
                scatter_chart.add_trace(go.Scatter(
                    x=x_line,
                    y=y_line,
                    mode='lines',
                    line=dict(color='red', width=2),
                    name=f'回帰線 (r={correlation:.3f})',
                    showlegend=True
                ))
            
            scatter_chart.update_layout(
                title=f'{display_name}<br>相関係数 r = {correlation:.3f} (95%CI: [{ci_lower:.3f}, {ci_upper:.3f}])<br>病院数: {len(hospital_stats)}',
                xaxis_title='平均口コミスコア',
                yaxis_title='平均星評価スコア',
                width=400,
                height=400,
                showlegend=True
            )
            
            scatter_charts.append(scatter_chart)
        
        # MAEでモデルをソートして、デフォルト選択用の情報を追加
        mae_sorted_models = sorted(models, key=lambda m: performance_metrics[m]['mae'])
        
        # チャートをJSONに変換
        charts_json = {
            'correlation_chart': json.dumps(correlation_chart, cls=plotly.utils.PlotlyJSONEncoder),
            'mae_chart': json.dumps(mae_chart, cls=plotly.utils.PlotlyJSONEncoder),
            'scatter_charts': [json.dumps(chart, cls=plotly.utils.PlotlyJSONEncoder) for chart in scatter_charts],
            'model_list': models,
            'best_model': mae_sorted_models[0] if mae_sorted_models else models[0],
            'second_best_model': mae_sorted_models[1] if len(mae_sorted_models) > 1 else models[1] if len(models) > 1 else models[0],
            'performance_metrics': performance_metrics,
            'correlation_cis': {model: {'lower': ci[0], 'upper': ci[1]} for model, ci in zip(models, correlation_cis)}
        }
        
        return jsonify(charts_json)
        
    except Exception as e:
        return jsonify({'error': f'チャート生成エラー: {str(e)}'}), 500

@app.route('/get_performance_metrics')
def get_performance_metrics():
    global analysis_results
    
    if analysis_results is None:
        return jsonify({'error': '分析結果がありません'}), 400
    
    return jsonify({
        'success': True,
        'performance_metrics': analysis_results['performance_metrics']
    })

@app.route('/statistical_test', methods=['POST'])
def statistical_test():
    global analysis_results
    
    if analysis_results is None:
        return jsonify({'error': '分析結果がありません'}), 400
    
    try:
        # リクエストから比較するモデルを取得
        data = request.get_json()
        model1 = data.get('model1')
        model2 = data.get('model2')
        
        if not model1 or not model2:
            return jsonify({'error': 'モデルが指定されていません'}), 400
        
        if model1 == model2:
            return jsonify({'error': '異なるモデルを選択してください'}), 400
        
        hospital_stats = analysis_results['hospital_stats']
        
        # モデルのカラム名を生成
        model1_col = f'{model1}_score'
        model2_col = f'{model2}_score'
        
        # カラムが存在するかチェック
        if model1_col not in hospital_stats.columns or model2_col not in hospital_stats.columns:
            return jsonify({'error': 'モデルデータが見つかりません'}), 400
        
        # データ準備
        star_scores = hospital_stats['star_score'].values
        model1_scores = hospital_stats[model1_col].values
        model2_scores = hospital_stats[model2_col].values
        
        print(f"統計検定開始: {model1} vs {model2}")
        print(f"データ数: {len(star_scores)}")
        
        # オリジナルのMAEを計算
        mae1 = mean_absolute_error(star_scores, model1_scores)
        mae2 = mean_absolute_error(star_scores, model2_scores)
        
        print(f"オリジナルMAE: {model1}={mae1:.4f}, {model2}={mae2:.4f}")
        
        # ブートストラップ法による検定
        bootstrap_iterations = 10000
        mae_differences = []
        
        np.random.seed(42)  # 再現可能な結果のため
        
        for i in range(bootstrap_iterations):
            # ブートストラップサンプリング
            n = len(star_scores)
            indices = np.random.choice(n, size=n, replace=True)
            
            # リサンプリングされたデータでMAE計算
            boot_star = star_scores[indices]
            boot_model1 = model1_scores[indices]
            boot_model2 = model2_scores[indices]
            
            boot_mae1 = mean_absolute_error(boot_star, boot_model1)
            boot_mae2 = mean_absolute_error(boot_star, boot_model2)
            
            # MAEの差を記録
            mae_diff = boot_mae2 - boot_mae1
            mae_differences.append(mae_diff)
            
            # 進捗表示（1000回ごと）
            if (i + 1) % 1000 == 0:
                print(f"ブートストラップ進捗: {i + 1}/{bootstrap_iterations}")
        
        # 95%信頼区間を計算
        mae_differences = np.array(mae_differences)
        confidence_interval = [
            float(np.percentile(mae_differences, 2.5)),
            float(np.percentile(mae_differences, 97.5))
        ]
        
        print(f"95%信頼区間: [{confidence_interval[0]:.4f}, {confidence_interval[1]:.4f}]")
        
        # 結果をまとめる
        result = {
            'model1': model1,
            'model2': model2,
            'mae1': float(mae1),
            'mae2': float(mae2),
            'mae_difference': float(mae2 - mae1),
            'confidence_interval': confidence_interval,
            'bootstrap_iterations': bootstrap_iterations,
            'is_significant': confidence_interval[0] > 0 or confidence_interval[1] < 0
        }
        
        return jsonify({'success': True, 'result': result})
        
    except Exception as e:
        print(f"統計検定エラー: {str(e)}")
        return jsonify({'error': f'統計検定エラー: {str(e)}'}), 500

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

@app.route('/download_sample')
def download_sample():
    """サンプルデータのダウンロード"""
    try:
        sample_file_path = os.path.join(os.path.dirname(__file__), 'sample_data.csv')
        
        if not os.path.exists(sample_file_path):
            return jsonify({'error': 'サンプルファイルが見つかりません'}), 404
        
        return send_file(
            sample_file_path,
            mimetype='text/csv',
            as_attachment=True,
            download_name='動物病院口コミサンプル.csv'
        )
        
    except Exception as e:
        return jsonify({'error': f'ダウンロードエラー: {str(e)}'}), 500

@app.route('/load_sample_data', methods=['GET'])
def load_sample_data():
    """JavaScript用のサンプルデータロード（GETリクエスト）"""
    global uploaded_data
    
    try:
        sample_file_path = os.path.join(os.path.dirname(__file__), 'sample_data.csv')
        
        if not os.path.exists(sample_file_path):
            return jsonify({'success': False, 'error': 'サンプルファイルが見つかりません'}), 404
        
        # CSVファイルを読み込み
        df = pd.read_csv(sample_file_path, encoding='utf-8')
        
        # 必要な列があるかチェック
        required_columns = ['hospital_id', 'review_text', 'star_rating']
        if not all(col in df.columns for col in required_columns):
            return jsonify({'success': False, 'error': f'必要な列が不足しています: {required_columns}'}), 400
        
        # データ型チェック
        df['star_rating'] = pd.to_numeric(df['star_rating'], errors='coerce')
        df = df.dropna(subset=['star_rating'])
        df['star_rating'] = df['star_rating'].astype(int)
        
        # uploaded_data にセット
        uploaded_data = df
        
        # JSONレスポンス用にデータを変換
        data_for_js = df.to_dict('records')
        
        print(f"サンプルデータロード成功: {len(df)}件のレビュー")
        
        return jsonify({
            'success': True, 
            'data': data_for_js,
            'message': f'サンプルデータを読み込みました（{len(df)}件のレビュー）'
        })
        
    except Exception as e:
        print(f"サンプルデータロードエラー: {str(e)}")
        return jsonify({'success': False, 'error': f'サンプルロードエラー: {str(e)}'}), 500

@app.route('/load_sample', methods=['POST'])
def load_sample():
    """サンプルデータを直接ロード"""
    global uploaded_data
    
    try:
        sample_file_path = os.path.join(os.path.dirname(__file__), 'sample_data.csv')
        
        if not os.path.exists(sample_file_path):
            return jsonify({'error': 'サンプルファイルが見つかりません'}), 400
        
        # CSVファイルを読み込み
        df = pd.read_csv(sample_file_path)
        
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
        total_reviews = len(df)
        unique_hospitals = df['hospital_id'].nunique()
        avg_star_rating = float(df['star_rating'].mean())
        star_distribution = df['star_rating'].value_counts().sort_index().to_dict()
        
        print(f"サンプルデータロード: 総口コミ数={total_reviews}, 病院数={unique_hospitals}, 平均星評価={avg_star_rating:.2f}")
        print(f"病院ID一覧: {df['hospital_id'].unique().tolist()}")
        
        stats = {
            'total_reviews': total_reviews,
            'unique_hospitals': unique_hospitals,
            'avg_star_rating': avg_star_rating,
            'star_distribution': star_distribution
        }
        
        return jsonify({'success': True, 'stats': stats, 'sample_loaded': True})
        
    except Exception as e:
        return jsonify({'error': f'サンプルロードエラー: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5004)
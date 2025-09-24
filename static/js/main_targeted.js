/**
 * 動物病院口コミ分析システム - 修正版JavaScript
 * 5つの主要問題に対する targeted fixes
 */

let uploadedData = null;
let analysisResults = null;
let currentCorrelationData = null;

// DOM読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded - targeted fixes version');
    
    // Chart.jsの可用性確認
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded! Charts will not work.');
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js loaded after delay');
                initializeApp();
            } else {
                console.error('Chart.js still not available - check CDN');
                initializeApp(); // Chart.js無しでも基本機能は動作させる
            }
        }, 2000);
    } else {
        console.log('Chart.js loaded successfully');
        initializeApp();
    }
});

function initializeApp() {
    console.log('Initializing app...');
    
    // DOM要素の存在確認
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const runTestBtn = document.getElementById('runTestBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    console.log('DOM elements:', {
        fileInput: !!fileInput,
        uploadArea: !!uploadArea, 
        loadSampleBtn: !!loadSampleBtn,
        analyzeBtn: !!analyzeBtn,
        runTestBtn: !!runTestBtn,
        exportBtn: !!exportBtn
    });
    
    // より詳細なデバッグ情報
    if (!fileInput) console.error('fileInput element not found!');
    if (!uploadArea) console.error('uploadArea element not found!');
    console.log('Event listeners setup starting...');

    if (fileInput) {
        console.log('Adding change event listener to fileInput');
        fileInput.addEventListener('change', handleFileSelect);
        console.log('Change event listener added successfully');
    } else {
        console.error('fileInput not found - cannot add event listener');
    }

    if (uploadArea) {
        // ドラッグ&ドロップ機能
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelect();
            }
        });
    }

    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', loadSampleData);
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', runAnalysis);
    }

    if (runTestBtn) {
        runTestBtn.addEventListener('click', runStatisticalTest);
    }

    // ダウンロードサンプルボタンは削除済み

    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
    }

    // 初期状態の設定
    if (analyzeBtn) analyzeBtn.disabled = true;
    if (runTestBtn) runTestBtn.disabled = true;
}

/**
 * 問題1の修正: ファイル選択画面の混乱
 * サンプルデータ使用時に明確な状態表示
 */
function showFileSelectionState(type, filename = null) {
    const uploadArea = document.getElementById('uploadArea');
    
    if (type === 'sample') {
        uploadArea.innerHTML = `
            <div class="alert alert-success border-0 mb-0">
                <div class="text-center">
                    <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <h5 class="mb-2"><strong>サンプルデータを使用中</strong></h5>
                    <p class="mb-2">動物病院口コミデータ（50件）が読み込まれました</p>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="resetUpload()">
                            <i class="fas fa-undo me-1"></i>別のファイルを選択
                        </button>

                    </div>
                </div>
            </div>
        `;
    } else if (type === 'uploaded' && filename) {
        uploadArea.innerHTML = `
            <div class="alert alert-info border-0 mb-0">
                <div class="text-center">
                    <i class="fas fa-file-csv fa-3x text-info mb-3"></i>
                    <h5 class="mb-2"><strong>ファイルアップロード完了</strong></h5>
                    <p class="mb-2">${filename}</p>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="resetUpload()">
                            <i class="fas fa-undo me-1"></i>別のファイルを選択
                        </button>

                    </div>
                </div>
            </div>
        `;
    }
}

function resetUpload() {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
        <h5>CSVファイルをアップロード</h5>
        <p class="text-muted">ファイルをドラッグ&ドロップするか、クリックして選択してください</p>
        <input type="file" id="fileInput" accept=".csv" class="d-none">
        <button class="btn btn-outline-primary me-2" onclick="document.getElementById('fileInput').click()">
            <i class="fas fa-folder-open me-1"></i>ファイルを選択
        </button>
        <button class="btn btn-outline-success" id="loadSampleBtn" onclick="loadSampleData()">
            <i class="fas fa-download me-1"></i>サンプル使用
        </button>
    `;
    
    // ファイルイベントリスナーを再設定
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // データリセット
    uploadedData = null;
    analysisResults = null;
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('runTestBtn').disabled = true;
    
    // 結果セクションを非表示
    document.getElementById('analysisSection').style.display = 'none';
    document.getElementById('statisticalSection').style.display = 'none';
}



function handleFileSelect() {
    console.log('handleFileSelect called');
    const fileInput = document.getElementById('fileInput');
    console.log('fileInput:', fileInput);
    const file = fileInput.files[0];
    console.log('Selected file:', file);
    
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('CSVファイルを選択してください。');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            uploadedData = parseCSV(csv);
            console.log('Uploaded data:', uploadedData.length, 'records');
            
            // 修正: ファイル選択状態の明確な表示
            showFileSelectionState('uploaded', file.name);
            document.getElementById('analyzeBtn').disabled = false;
        } catch (error) {
            console.error('CSV parsing error:', error);
            alert('CSVファイルの解析に失敗しました。形式を確認してください。');
        }
    };
    reader.readAsText(file, 'UTF-8');
}

function loadSampleData() {
    console.log('🔄 Loading sample data...');
    
    fetch('/load_sample_data')
        .then(response => {
            console.log('📡 Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('📊 Response data:', data);
            if (data.success) {
                uploadedData = data.data;
                console.log('✅ Sample data loaded:', uploadedData.length, 'records');
                
                // 修正: サンプルデータ状態の明確な表示
                showFileSelectionState('sample');
                document.getElementById('analyzeBtn').disabled = false;
                
                // 成功メッセージ表示
                alert(`サンプルデータを読み込みました（${uploadedData.length}件のレビュー）`);
            } else {
                console.error('❌ Sample data loading failed:', data.error);
                alert('サンプルデータの読み込みに失敗しました: ' + data.error);
            }
        })
        .catch(error => {
            console.error('❌ Sample data loading error:', error);
            alert('サンプルデータの読み込みに失敗しました: ' + error.message);
        });
}

/**
 * 問題3の修正: 進行状況の明確な表示
 */
function showProgressIndicator(stage, message) {
    const progressDiv = document.getElementById('progress-indicator') || createProgressIndicator();
    
    const stages = {
        'upload': { icon: 'fa-upload', color: 'info', text: 'アップロード中' },
        'analysis': { icon: 'fa-brain', color: 'warning', text: '分析実行中' },
        'chart': { icon: 'fa-chart-bar', color: 'primary', text: 'チャート生成中' },
        'complete': { icon: 'fa-check', color: 'success', text: '完了' },
        'error': { icon: 'fa-exclamation-triangle', color: 'danger', text: 'エラー' }
    };
    
    const stageInfo = stages[stage] || stages['analysis'];
    
    progressDiv.innerHTML = `
        <div class="alert alert-${stageInfo.color} border-0">
            <div class="d-flex align-items-center">
                <i class="fas ${stageInfo.icon} fa-spin me-2"></i>
                <span class="fw-bold">${stageInfo.text}</span>
                ${message ? `<span class="ms-2">- ${message}</span>` : ''}
            </div>
        </div>
    `;
    progressDiv.style.display = 'block';
    
    if (stage === 'complete' || stage === 'error') {
        setTimeout(() => {
            progressDiv.style.display = 'none';
        }, 3000);
    }
}

function createProgressIndicator() {
    const progressDiv = document.createElement('div');
    progressDiv.id = 'progress-indicator';
    progressDiv.style.position = 'fixed';
    progressDiv.style.top = '20px';
    progressDiv.style.right = '20px';
    progressDiv.style.zIndex = '9999';
    progressDiv.style.maxWidth = '400px';
    document.body.appendChild(progressDiv);
    return progressDiv;
}

function runAnalysis() {
    if (!uploadedData || uploadedData.length === 0) {
        alert('データをアップロードしてください。');
        return;
    }

    console.log('🚀 Starting analysis with data:', uploadedData.length, 'records');
    console.log('📊 Sample data record:', uploadedData[0]);
    showProgressIndicator('analysis', '感情分析を実行中...');
    
    const requestBody = { data: uploadedData };
    console.log('📡 Sending request to /analyze with body:', {
        dataLength: uploadedData.length,
        bodySize: JSON.stringify(requestBody).length
    });
    
    fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            analysisResults = data.results;
            console.log('✅ Analysis completed successfully, results:', analysisResults);
            console.log('✅ Results type check:', typeof analysisResults);
            console.log('✅ Results keys:', Object.keys(analysisResults));
            
            showProgressIndicator('chart', 'チャートを生成中...');
            
            try {
                // 結果表示
                console.log('🎨 Starting display...');
                displayAnalysisResults(analysisResults);
                
                // MAE結果表示
                if (analysisResults.mae_results) {
                    console.log('📊 Displaying MAE results...');
                    displayMAEResults(analysisResults.mae_results);
                }
                
                // モデル推奨表示
                if (analysisResults.model_recommendation) {
                    console.log('🏆 Displaying model recommendation...');
                    displayModelRecommendation(analysisResults.model_recommendation);
                }
                
                // 分析結果の解釈を生成
                setTimeout(() => {
                    generateAnalysisInterpretation(analysisResults);
                }, 500);
                
                document.getElementById('runTestBtn').disabled = false;
                showProgressIndicator('complete', '分析完了');
                console.log('✅ Display completed successfully');
            } catch (displayError) {
                console.error('❌ Display error:', displayError);
                showProgressIndicator('error', '表示エラー: ' + displayError.message);
                alert('表示エラー詳細: ' + displayError.message + '\\n' + displayError.stack);
            }
        } else {
            showProgressIndicator('error', data.error || '分析に失敗しました');
            console.error('Analysis failed:', data.error);
        }
    })
    .catch(error => {
        console.error('❌ NETWORK/PARSE ERROR:', error);
        console.error('❌ Error details:', {
            type: typeof error,
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        showProgressIndicator('error', 'ネットワークエラー: ' + error.message);
        
        // デバッグ用のアラート
        alert('エラー詳細:\\n' +
              'Type: ' + typeof error + '\\n' +
              'Name: ' + error.name + '\\n' + 
              'Message: ' + error.message + '\\n' +
              '\\nコンソールで詳細を確認してください');
    });
}

/**
 * 問題2の修正: チャート表示の切れ問題
 */
function displayAnalysisResults(results) {
    console.log('Displaying analysis results:', results);
    
    try {
        const analysisSection = document.getElementById('resultsSection');
        if (!analysisSection) {
            console.error('resultsSection element not found');
            return;
        }
        analysisSection.style.display = 'block';
        
        // 基本統計の表示
        console.log('📊 Displaying basic stats...', results.basic_stats);
        try {
            displayBasicStats(results.basic_stats);
            console.log('✅ Basic stats displayed');
        } catch (e) {
            console.error('❌ Basic stats error:', e);
        }
        
        // モデル比較チャートとテーブル - 強制表示
        console.log('📊 Displaying model comparison...', results.model_comparison);
        if (results.model_comparison) {
            try {
                displayModelComparisonChart(results.model_comparison);
                console.log('✅ Model comparison chart displayed');
            } catch (e) {
                console.error('❌ Model comparison chart error:', e);
            }
            
            try {
                displayModelComparisonTable(results.model_comparison);
                console.log('✅ Model comparison table displayed');
            } catch (e) {
                console.error('❌ Model comparison table error:', e);
            }
        } else {
            console.error('❌ No model comparison data available');
        }
        
        // 星評価分布チャート - 強制Canvas表示
        console.log('⭐ Displaying star rating chart...', results.star_rating_distribution);
        if (results.star_rating_distribution) {
            try {
                displayStarRatingChart(results.star_rating_distribution);
                console.log('✅ Star rating chart displayed');
            } catch (e) {
                console.error('❌ Star rating chart error:', e);
                console.error('Error details:', e.stack);
            }
        } else {
            console.error('❌ No star rating distribution data available');
        }
        
        // 星評価と感情スコア分布
        console.log('📈 Displaying sentiment distribution chart...', results.sentiment_correlation);
        try {
            displaySentimentDistributionChart(results.sentiment_correlation);
            console.log('✅ Sentiment distribution chart displayed');
        } catch (e) {
            console.error('❌ Sentiment distribution chart error:', e);
        }
        
        // 病院別分析
        console.log('🏥 Displaying hospital analysis...', results.hospital_analysis);
        try {
            displayHospitalAnalysis(results.hospital_analysis);
            console.log('✅ Hospital analysis displayed');
        } catch (e) {
            console.error('❌ Hospital analysis error:', e);
        }
        
        // 統計検定結果
        if (results.sentiment_correlation) {
            console.log('📊 Displaying correlation results...', results.sentiment_correlation.correlations);
            try {
                displayCorrelationResults(results.sentiment_correlation.correlations);
                console.log('✅ Correlation results displayed');
            } catch (e) {
                console.error('❌ Correlation results error:', e);
            }
        }
        
        // モデル性能検定結果
        if (results.model_performance_tests) {
            console.log('🔬 Displaying performance test results...', results.model_performance_tests);
            try {
                displayPerformanceTestResults(results.model_performance_tests);
                console.log('✅ Performance test results displayed');
            } catch (e) {
                console.error('❌ Performance test results error:', e);
            }
        }
        
        console.log('All charts displayed successfully');
        
        // 分析結果の総括解釈を生成
        try {
            generateAnalysisInterpretation(results);
            console.log('✅ Analysis interpretation generated');
        } catch (e) {
            console.error('❌ Analysis interpretation error:', e);
        }
        
    } catch (error) {
        console.error('Error in displayAnalysisResults:', error);
        showProgressIndicator('error', 'チャート表示エラー');
    }
}

function displayStarRatingChart(starData) {
    console.log('🎯 Creating star rating chart with data:', starData);
    const ctx = document.getElementById('starRatingChart');
    if (!ctx) {
        console.error('⚠️ starRatingChart element not found');
        return;
    }
    
    // Chart.js利用不可のため、常にCanvasフォールバックを使用
    console.log('📊 Creating Canvas pie chart for star ratings...');
    
    const total = Object.values(starData).reduce((sum, count) => sum + count, 0);
    console.log(`📈 Total reviews: ${total}`);
    
    if (total === 0) {
        ctx.innerHTML = '<div class="alert alert-warning">星評価データがありません</div>';
        return;
    }
    
    // コンテナをクリアしてCanvasを作成
    ctx.innerHTML = '';
    const canvasContainer = document.createElement('div');
    canvasContainer.style.textAlign = 'center';
    
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.style.border = '2px solid #e9ecef';
    canvas.style.borderRadius = '8px';
    canvas.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    canvasContainer.appendChild(canvas);
    ctx.appendChild(canvasContainer);
    
    // 改良版円グラフを描画
    const context = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    
    const colors = ['#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997'];
    let currentAngle = -Math.PI / 2; // 12時方向から開始
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // 円グラフを描画
    ['1', '2', '3', '4', '5'].forEach((rating, index) => {
        const count = starData[rating] || 0;
        const angle = total > 0 ? (count / total) * 2 * Math.PI : 0;
        
        if (angle > 0) {
            // 円グラフのセクションを描画
            context.beginPath();
            context.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
            context.lineTo(centerX, centerY);
            context.fillStyle = colors[index];
            context.fill();
            context.strokeStyle = '#fff';
            context.lineWidth = 3;
            context.stroke();
            
            // ラベルを追加（外側）
            const labelAngle = currentAngle + angle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            context.fillStyle = '#fff';
            context.font = 'bold 14px Arial';
            context.textAlign = 'center';
            context.fillText(`★${rating}`, labelX, labelY - 5);
            context.fillText(`${count}件`, labelX, labelY + 12);
            
            currentAngle += angle;
        }
    });
    
    // タイトルを追加
    context.fillStyle = '#333';
    context.font = 'bold 20px Arial';
    context.textAlign = 'center';
    context.fillText('星評価分布', centerX, 30);
    
    // 合計件数表示
    context.fillStyle = '#666';
    context.font = '16px Arial';
    context.fillText(`合計: ${total}件`, centerX, canvas.height - 15);
    
    // テーブルも追加
    const tableHtml = `
        <div class="mt-3">
            <h6><i class="fas fa-table me-2"></i>星評価詳細</h6>
            <table class="table table-sm table-striped">
                <thead class="table-dark">
                    <tr><th>星評価</th><th>件数</th><th>割合</th></tr>
                </thead>
                <tbody>
                    ${['1', '2', '3', '4', '5'].map((rating, index) => {
                        const count = starData[rating] || 0;
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        return `<tr>
                            <td><span style="color: ${colors[index]}; font-weight: bold;">★${rating}</span></td>
                            <td>${count}件</td>
                            <td>${percentage}%</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    const tableDiv = document.createElement('div');
    tableDiv.innerHTML = tableHtml;
    ctx.appendChild(tableDiv);
    
    console.log('✅ Canvas pie chart created successfully');
}


function displayModelComparisonTable(modelData) {
    console.log('🎯 Creating model comparison table with data:', modelData);
    const container = document.getElementById('modelComparisonTable');
    if (!container) {
        console.error('⚠️ modelComparisonTable element not found');
        return;
    }
    
    const models = Object.keys(modelData);
    
    let html = `
        <div class="card mt-3">
            <div class="card-header">
                <h6 class="mb-0"><i class="fas fa-table me-2"></i>モデル性能詳細比較表</h6>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>モデル名</th>
                                <th>MAE (Mean Absolute Error)</th>
                                <th>相関係数</th>
                                <th>性能ランク</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    // MAEでソート（昇順 - 低いほど良い）
    const sortedModels = models.sort((a, b) => (modelData[a].mae || 0) - (modelData[b].mae || 0));
    
    sortedModels.forEach((model, index) => {
        const data = modelData[model];
        const modelName = model.replace('cl-tohoku/', '').replace('/bert-base-japanese', '');
        const mae = data.mae || 0;
        const correlation = data.correlation || 0;
        const rank = index + 1;
        const rankBadge = rank === 1 ? 'bg-warning' : rank === 2 ? 'bg-secondary' : 'bg-light text-dark';
        const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
        
        html += `
            <tr>
                <td><strong>${modelName}</strong></td>
                <td>${mae.toFixed(4)}</td>
                <td>${correlation.toFixed(3)}</td>
                <td><span class="badge ${rankBadge}">${rankIcon} ${rank}位</span></td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function displayModelComparisonChart(modelData) {
    const ctx = document.getElementById('modelChart');
    if (!ctx) return;
    
    // Chart.jsの可用性確認
    if (typeof Chart === 'undefined') {
        console.log('Chart.js not available - using enhanced table display for model comparison');
        // 代替表示: 改良版テーブル形式でモデル性能を表示
        const models = Object.keys(modelData);
        
        // MAEでソート（昇順 - 低いほど高性能）
        const sortedModels = models.sort((a, b) => (modelData[a].mae || 0) - (modelData[b].mae || 0));
        
        let tableHtml = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0"><i class="fas fa-chart-bar me-2"></i>モデル性能比較詳細</h6>
                </div>
                <div class="card-body">
                    <div class="alert alert-info mb-3">
                        <small><i class="fas fa-info-circle me-1"></i>
                        Chart.jsが利用できないため、テーブル形式で表示しています。
                        MAE（平均絶対誤差）が低いほど高性能です。
                        </small>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th><i class="fas fa-trophy me-1"></i>ランク</th>
                                    <th>モデル名</th>
                                    <th>MAE <small>(低いほど良い)</small></th>
                                    <th>相関係数 <small>(高いほど良い)</small></th>
                                    <th>性能評価</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        sortedModels.forEach((model, index) => {
            const data = modelData[model];
            const modelName = model.replace('cl-tohoku/', '').replace('/bert-base-japanese', '').replace('Mizuiro-inc/', '');
            const mae = data.mae || 0;
            const correlation = data.correlation || 0;
            const rank = index + 1;
            
            // ランクアイコンとバッジ
            const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
            const rankBadge = rank === 1 ? 'bg-warning text-dark' : rank === 2 ? 'bg-secondary' : 'bg-info';
            
            // 性能レベル判定
            const performanceLevel = mae < 0.5 ? '優秀' : mae < 1.0 ? '良好' : mae < 1.5 ? '普通' : '要改善';
            const perfClass = mae < 0.5 ? 'text-success' : mae < 1.0 ? 'text-primary' : mae < 1.5 ? 'text-warning' : 'text-danger';
            
            // 相関の強さ
            const corrStrength = Math.abs(correlation) >= 0.8 ? '非常に強い' : 
                                Math.abs(correlation) >= 0.6 ? '強い' : 
                                Math.abs(correlation) >= 0.4 ? '中程度' : '弱い';
            const corrClass = Math.abs(correlation) >= 0.6 ? 'text-success' : 
                             Math.abs(correlation) >= 0.4 ? 'text-info' : 'text-secondary';
            
            tableHtml += `
                <tr>
                    <td>
                        <span class="badge ${rankBadge} fs-6">${rankIcon} ${rank}位</span>
                    </td>
                    <td><strong>${modelName}</strong></td>
                    <td>
                        <span class="fs-6 fw-bold">${mae.toFixed(4)}</span>
                        <br><small class="${perfClass}">${performanceLevel}</small>
                    </td>
                    <td>
                        <span class="fs-6 fw-bold">${correlation.toFixed(3)}</span>
                        <br><small class="${corrClass}">${corrStrength}</small>
                    </td>
                    <td>
                        <div class="d-flex flex-column align-items-center">
                            <div class="progress" style="width: 60px; height: 8px;">
                                <div class="progress-bar ${rank === 1 ? 'bg-success' : rank === 2 ? 'bg-info' : 'bg-secondary'}" 
                                     style="width: ${100 - (mae * 50)}%"></div>
                            </div>
                            <small class="${perfClass} mt-1">${(100 - (mae * 50)).toFixed(0)}%</small>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableHtml += `
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">
                            <i class="fas fa-lightbulb me-1"></i>
                            <strong>推奨:</strong> 1位の${sortedModels[0].replace('cl-tohoku/', '').replace('/bert-base-japanese', '').replace('Mizuiro-inc/', '')}が最高性能です。
                        </small>
                    </div>
                </div>
            </div>
        `;
        
        ctx.innerHTML = tableHtml;
        return;
    }
    
    // 既存のチャートを破棄
    if (window.modelChart && typeof window.modelChart.destroy === 'function') {
        window.modelChart.destroy();
    }
    
    console.log('Creating Chart.js model comparison chart...');
    
    const models = Object.keys(modelData);
    const maeScores = models.map(model => modelData[model].mae || 0);
    
    // 修正: チャートサイズ調整
    window.modelChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: models.map(model => model.replace('cl-tohoku/', '').replace('/bert-base-japanese', '')),
            datasets: [{
                label: 'MAE (Mean Absolute Error)',
                data: maeScores,
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
                borderColor: ['#ff6384', '#36a2eb', '#cc65fe'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.0,
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: 'モデル性能比較 (MAE)',
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'MAE値 (低いほど良い)'
                    }
                }
            }
        }
    });
}

function displaySentimentDistributionChart(sentimentData) {
    // Plotlyを使用して散布図を作成
    const traces = [];
    
    if (sentimentData && sentimentData.scatter_data && sentimentData.correlations) {
        const models = Object.keys(sentimentData.scatter_data);
        const colors = ['#ff6384', '#36a2eb', '#cc65fe'];
        
        models.forEach((model, index) => {
            const data = sentimentData.scatter_data[model];
            const correlation = sentimentData.correlations[model];
            
            // デバッグ: 正規化された星評価データの範囲確認（-2~+2）
            console.log(`Model ${model} normalized star ratings range:`, Math.min(...data.star_ratings), 'to', Math.max(...data.star_ratings));
            console.log(`First 5 normalized star ratings (-2~+2):`, data.star_ratings.slice(0, 5));
            console.log(`ALL star ratings for ${model}:`, data.star_ratings);
            
            // 散布図（サーバー側で既に正規化済み: star_score = star_rating - 3）
            console.log(`PLOTLY TRACE DATA for ${model}:`, data.star_ratings);
            traces.push({
                x: data.star_ratings,  // バックエンドで-2から+2に正規化済み（star_score使用）
                y: data.sentiment_scores,
                mode: 'markers',
                type: 'scatter',
                name: `${model.replace('Model ', '')} (r=${correlation.correlation.toFixed(3)})`,
                marker: {
                    color: colors[index % colors.length],
                    size: 8,
                    opacity: 0.7
                }
            });
            
            // 回帰直線を計算（サーバー側で既に正規化済み）
            const regression = calculateRegression(data.star_ratings, data.sentiment_scores);
            const xRange = [-2, -1, 0, 1, 2];
            const yRegression = xRange.map(x => regression.slope * x + regression.intercept);
            
            // 回帰直線を追加
            traces.push({
                x: xRange,
                y: yRegression,
                mode: 'lines',
                type: 'scatter',
                name: `回帰直線 ${model.replace('Model ', '')}`,
                line: {
                    color: colors[index % colors.length],
                    width: 2,
                    dash: 'dash'
                },
                showlegend: false
            });
        });
    }
    
    const layout = {
        title: '星評価と感情スコアの分布（回帰直線付き）',
        xaxis: { 
            title: '星評価スコア（正規化）',
            range: [-2.5, 2.5],
            dtick: 1,
            tickvals: [-2, -1, 0, 1, 2],
            ticktext: ['★1', '★2', '★3', '★4', '★5']
        },
        yaxis: { 
            title: '感情スコア',
            range: [-2.5, 2.5],
            dtick: 1,
            tickvals: [-2, -1, 0, 1, 2],
            zeroline: true
        },
        autosize: true,
        margin: { l: 80, r: 40, t: 80, b: 80 },
        showlegend: true,
        annotations: [
            {
                text: '注：相関係数(r)は各モデル名の後に表示',
                showarrow: false,
                x: 0.02,
                y: 0.98,
                xref: 'paper',
                yref: 'paper',
                font: { size: 10 }
            }
        ]
    };
    
    const config = {
        responsive: true,
        displayModeBar: true
    };
    
    console.log('=== FINAL PLOTLY DATA BEFORE RENDERING ===');
    console.log('Number of traces:', traces.length);
    traces.forEach((trace, index) => {
        if (trace.mode === 'markers') {
            console.log(`Trace ${index} (${trace.name}) X data:`, trace.x);
            console.log(`  X range: ${Math.min(...trace.x)} to ${Math.max(...trace.x)}`);
        }
    });
    console.log('X-axis layout range:', layout.xaxis.range);
    console.log('Y-axis layout range:', layout.yaxis.range);
    
    Plotly.newPlot('sentimentDistributionChart', traces, layout, config);
}

// 回帰直線計算のヘルパー関数
function calculateRegression(xData, yData) {
    const n = xData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += xData[i];
        sumY += yData[i];
        sumXY += xData[i] * yData[i];
        sumXX += xData[i] * xData[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
}

/**
 * 問題4&5の修正: 統計検定結果の表示とプルダウンメニュー
 */
function runStatisticalTest() {
    if (!analysisResults) {
        alert('まず分析を実行してください。');
        return;
    }

    showProgressIndicator('analysis', '統計検定を実行中...');

    // プルダウンメニューの値を取得
    const model1Select = document.getElementById('model1Select');
    const model2Select = document.getElementById('model2Select');
    
    // 修正: プルダウンメニューが存在することを確認し、値を設定
    if (!model1Select || !model2Select) {
        console.error('Dropdown menus not found, creating them...');
        createDropdownMenus();
        return;
    }
    
    const model1 = model1Select.value;
    const model2 = model2Select.value;
    
    if (!model1 || !model2) {
        alert('比較するモデルを両方選択してください。');
        showProgressIndicator('error', 'モデルが選択されていません');
        return;
    }
    
    if (model1 === model2) {
        alert('異なるモデルを選択してください。');
        showProgressIndicator('error', '同じモデルが選択されています');
        return;
    }

    fetch('/statistical_test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model1: model1,
            model2: model2,
            results: analysisResults
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Statistical test completed:', data);
            displayStatisticalResults(data.test_results);
            showProgressIndicator('complete', '統計検定完了');
        } else {
            console.error('Statistical test failed:', data.error);
            alert('統計検定に失敗しました: ' + data.error);
            showProgressIndicator('error', data.error);
        }
    })
    .catch(error => {
        console.error('Statistical test error:', error);
        alert('統計検定でエラーが発生しました。');
        showProgressIndicator('error', 'ネットワークエラー');
    });
}

// 修正: プルダウンメニューを強制的に作成する関数
function createDropdownMenus() {
    console.log('Creating dropdown menus...');
    
    const models = ['cl-tohoku/bert-base-japanese-whole-word-masking', 
                   'llm-book/bert-base-japanese-v3', 
                   'Mizuiro-sakura/luke-japanese-base-finetuned-vet'];
    
    // Model 1 dropdown
    let model1Select = document.getElementById('model1Select');
    if (!model1Select) {
        const model1Container = document.querySelector('[data-model="1"]') || 
                               document.querySelector('.col-md-6:first-child .form-select') ||
                               document.querySelector('#statisticalSection .form-select');
        
        if (model1Container && model1Container.tagName === 'SELECT') {
            model1Select = model1Container;
            model1Select.id = 'model1Select';
        } else if (model1Container) {
            model1Select = document.createElement('select');
            model1Select.id = 'model1Select';
            model1Select.className = 'form-select';
            model1Container.appendChild(model1Select);
        }
    }
    
    // Model 2 dropdown
    let model2Select = document.getElementById('model2Select');
    if (!model2Select) {
        const model2Container = document.querySelector('[data-model="2"]') || 
                               document.querySelector('.col-md-6:last-child .form-select') ||
                               document.querySelectorAll('#statisticalSection .form-select')[1];
        
        if (model2Container && model2Container.tagName === 'SELECT') {
            model2Select = model2Container;
            model2Select.id = 'model2Select';
        } else if (model2Container) {
            model2Select = document.createElement('select');
            model2Select.id = 'model2Select';
            model2Select.className = 'form-select';
            model2Container.appendChild(model2Select);
        }
    }
    
    // 両方のプルダウンメニューにオプションを追加
    [model1Select, model2Select].forEach((select, index) => {
        if (!select) return;
        
        select.innerHTML = '<option value="">モデルを選択...</option>';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model.replace('cl-tohoku/', '').replace('/bert-base-japanese', '');
            select.appendChild(option);
        });
        
        // デフォルト値を設定
        if (index === 0) select.value = models[0];
        if (index === 1) select.value = models[1];
    });
    
    console.log('Dropdown menus created successfully');
}

// 修正: 統計検定結果の明確な表示
function displayStatisticalResults(results) {
    console.log('Displaying statistical results:', results);
    
    const statisticalSection = document.getElementById('statisticalSection');
    statisticalSection.style.display = 'block';
    
    // 結果表示エリアを見つけるか作成
    let resultsContainer = document.getElementById('statisticalResults');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'statisticalResults';
        resultsContainer.className = 'mt-4';
        statisticalSection.appendChild(resultsContainer);
    }
    
    // 修正: 統計検定結果の詳細表示
    resultsContainer.innerHTML = `
        <div class="card">
            <div class="card-header bg-info text-white">
                <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>統計検定結果</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6><i class="fas fa-balance-scale me-2"></i>Bootstrap検定結果</h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>p値:</span>
                                <span class="fw-bold ${results.p_value < 0.05 ? 'text-danger' : 'text-success'}">${results.p_value.toFixed(6)}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>有意性:</span>
                                <span class="fw-bold ${results.p_value < 0.05 ? 'text-danger' : 'text-success'}">
                                    ${results.p_value < 0.05 ? '有意差あり (p < 0.05)' : '有意差なし (p ≥ 0.05)'}
                                </span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>効果量:</span>
                                <span class="fw-bold">${results.effect_size.toFixed(4)}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6><i class="fas fa-chart-bar me-2"></i>信頼区間 (95%)</h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>下限:</span>
                                <span class="fw-bold">${results.confidence_interval[0].toFixed(4)}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>上限:</span>
                                <span class="fw-bold">${results.confidence_interval[1].toFixed(4)}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>平均差:</span>
                                <span class="fw-bold">${results.mean_difference.toFixed(4)}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="alert alert-light border">
                            <h6><i class="fas fa-info-circle me-2"></i>解釈</h6>
                            <p class="mb-0">
                                ${results.p_value < 0.05 
                                    ? '2つのモデルの性能には統計的に有意な差があります。効果量は' + Math.abs(results.effect_size).toFixed(4) + 'です。'
                                    : '2つのモデルの性能に統計的に有意な差は見られませんでした。'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 結果が見えるようにスクロール
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// その他のヘルパー関数
function displayBasicStats(stats) {
    const statsContainer = document.getElementById('basicStats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">${stats.total_reviews}</h5>
                        <p class="card-text">総レビュー数</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">${stats.unique_hospitals}</h5>
                        <p class="card-text">病院数</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">${stats.avg_rating.toFixed(2)}</h5>
                        <p class="card-text">平均星評価</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">${stats.avg_review_length.toFixed(0)}</h5>
                        <p class="card-text">平均文字数</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayHospitalAnalysis(hospitalData) {
    const container = document.getElementById('hospitalAnalysis');
    if (!container) return;
    
    // テーブル形式で1病院1行表示
    let html = `
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0"><i class="fas fa-hospital me-2"></i>病院別分析結果</h6>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>病院ID</th>
                                <th>レビュー数</th>
                                <th>平均星評価</th>
                                <th>Koheiduck</th>
                                <th>LLM-book</th>
                                <th>Mizuiro</th>
                                <th>平均感情スコア</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    Object.entries(hospitalData).forEach(([hospitalId, data]) => {
        // デバッグ: データ構造確認
        console.log(`Hospital ${hospitalId} data keys:`, Object.keys(data));
        console.log(`Hospital ${hospitalId} data:`, data);
        
        // モデルスコアの取得（バックエンドのキー名に合わせる）
        const koheiduck = data['Model A (Koheiduck)'] || 0;
        const llmbook = data['Model B (LLM-book)'] || 0;
        const mizuiro = data['Model C (Mizuiro)'] || 0;
        console.log(`Model scores - Koheiduck: ${koheiduck}, LLM-book: ${llmbook}, Mizuiro: ${mizuiro}`);
        
        // 星評価の取得（複数のキーパターンに対応）
        const avgRating = data.avg_rating || 0;
        
        html += `
            <tr>
                <td><strong>${hospitalId}</strong></td>
                <td>${data.review_count}件</td>
                <td>${avgRating.toFixed(2)}点</td>
                <td>${(koheiduck || 0).toFixed(3)}</td>
                <td>${(llmbook || 0).toFixed(3)}</td>
                <td>${(mizuiro || 0).toFixed(3)}</td>
                <td><strong>${data.avg_sentiment.toFixed(3)}</strong></td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// サンプルCSVダウンロード機能は削除済み
// function downloadSample() {
//     window.location.href = '/download_sample';
// }

function exportResults() {
    if (!analysisResults) {
        alert('エクスポートする結果がありません。まず分析を実行してください。');
        return;
    }
    
    console.log('📤 Exporting results...');
    
    try {
        // POSTリクエストでCSV形式でダウンロード
        fetch('/export_results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        })
        .then(blob => {
            // CSVファイルとしてダウンロード
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `veterinary_review_analysis_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log('✅ Export completed successfully');
        })
        .catch(error => {
            console.error('❌ Export error:', error);
            alert('エクスポートエラー: ' + error.message);
        });
    } catch (error) {
        console.error('❌ Export error:', error);
        alert('エクスポートエラー: ' + error.message);
    }
}

function displayCorrelationResults(correlationData) {
    const container = document.getElementById('correlationResults');
    if (!container) return;
    
    let html = '<div class="row">';
    
    Object.entries(correlationData).forEach(([model, data]) => {
        const significance = data.significant ? 'text-success' : 'text-muted';
        html += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">${model}</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>相関係数:</strong> ${data.correlation.toFixed(4)}</p>
                        <p><strong>p値:</strong> <span class="${significance}">${data.p_value.toFixed(6)}</span></p>
                        <p><strong>95%信頼区間:</strong> [${data.ci_lower.toFixed(4)}, ${data.ci_upper.toFixed(4)}]</p>
                        <p><strong>有意性:</strong> <span class="${significance}">${data.significant ? '有意 (p < 0.05)' : '非有意 (p ≥ 0.05)'}</span></p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function displayPerformanceTestResults(testData) {
    const container = document.getElementById('performanceTestResults');
    if (!container) return;
    
    let html = '<div class="row">';
    
    Object.entries(testData).forEach(([comparison, data]) => {
        const [model1, model2] = comparison.split('_vs_');
        const significance = data.significant ? 'text-danger' : 'text-success';
        
        html += `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">${model1} vs ${model2}</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>MAE差:</strong> ${data.mae_difference.toFixed(6)}</p>
                        <p><strong>p値:</strong> <span class="${significance}">${data.p_value.toFixed(6)}</span></p>
                        <p><strong>95%信頼区間:</strong> [${data.ci_lower.toFixed(6)}, ${data.ci_upper.toFixed(6)}]</p>
                        <p><strong>性能差:</strong> <span class="${significance}">${data.significant ? '有意差あり' : '有意差なし'}</span></p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// 追加: 分析結果の包括的解釈を生成する関数
function generateAnalysisInterpretation(results) {
    console.log('📊 Generating analysis interpretation...');
    
    const container = document.getElementById('analysisInterpretation');
    if (!container) return;
    
    // 統計データの取得
    const stats = results.basic_stats || {};
    const correlations = results.correlation_results || {};
    const performanceTests = results.performance_tests || {};
    const aggregatedData = results.aggregated_data || [];
    const maeResults = results.mae_results || {};
    const modelRecommendation = results.model_recommendation || {};
    
    // 基本統計の解釈
    const totalReviews = stats.total_reviews || 0;
    const avgRating = stats.avg_rating || 0;
    const hospitalCount = stats.unique_hospitals || 0;
    

    
    // 解釈テキストの生成
    let interpretationHTML = `
        <div class="alert alert-info mb-4">
            <h6><i class="fas fa-info-circle me-2"></i>分析概要</h6>
            <p class="mb-2">本分析では、${hospitalCount}件の動物病院から収集された${totalReviews}件のレビューデータを用いて、
            3つの日本語BERT感情分析モデルの性能比較を実施しました。</p>
            <p class="mb-2">平均評価: ${avgRating.toFixed(2)}点、分析対象期間のレビューを正規化星評価(-2〜+2)で評価しています。</p>
            <p class="mb-0"><strong>統計手法:</strong> ブートストラップ法（リサンプリング10,000回）を用いた信頼区間推定と統計的検定を実施。</p>
        </div>
        
        <div class="card border-info">
            <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="fas fa-lightbulb me-2"></i>実用性評価と推奨事項</h6>
            </div>
            <div class="card-body">
                <h6>📋 推奨される活用方法:</h6>
                <ul>
    `;
    
    // 推奨事項の生成（削除された変数への参照を削除）
    interpretationHTML += `<li><strong>📊 多モデル分析:</strong> 3つの日本語BERTモデルによる包括的な感情分析を実施</li>`;
    
    interpretationHTML += `
                    <li><strong>比較分析:</strong> 複数モデルの結果を組み合わせることで、より信頼性の高い分析が可能</li>
                    <li><strong>継続監視:</strong> 定期的な分析により、サービス品質の変化を早期発見できます</li>
                </ul>
                
                <h6 class="mt-4">⚠️ 注意事項:</h6>
                <ul>
                    <li>本分析は${totalReviews}件のサンプルに基づいており、より多くのデータで検証することを推奨</li>
                    <li>感情分析結果は参考値として活用し、実際の業務判断には複合的な要因を考慮してください</li>
                    <li>モデルの性能は対象ドメイン（獣医学）に特化した調整により向上する可能性があります</li>
                </ul>
            </div>
        </div>
    `;
    
    container.innerHTML = interpretationHTML;
    console.log('✅ Analysis interpretation generated successfully');
}

// 相関の強さを評価する補助関数
function getCorrelationStrength(r) {
    const abs_r = Math.abs(r);
    if (abs_r >= 0.8) return '非常に強い';
    if (abs_r >= 0.6) return '強い';
    if (abs_r >= 0.4) return '中程度';
    if (abs_r >= 0.2) return '弱い';
    return '非常に弱い';
}

// MAE計算の補助関数
function calculateMAE(data, scoreColumn, targetColumn) {
    if (!data || data.length === 0) return 0;
    
    let totalError = 0;
    let count = 0;
    
    data.forEach(row => {
        const predicted = parseFloat(row[scoreColumn]);
        const actual = parseFloat(row[targetColumn]);
        
        if (!isNaN(predicted) && !isNaN(actual)) {
            totalError += Math.abs(predicted - actual);
            count++;
        }
    });
    
    return count > 0 ? totalError / count : 0;
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                let value = values[index];
                // star_ratingを数値に変換
                if (header === 'star_rating') {
                    value = parseFloat(value) || 0;
                }
                row[header] = value;
            });
            data.push(row);
        }
    }
    
    return data;
}

// 初期化時にプルダウンメニューを設定
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        createDropdownMenus();
    }, 1000);
});
// MAE結果を表示する関数
function displayMAEResults(maeData) {
    const container = document.getElementById('maeResults');
    if (!container) {
        // コンテナが存在しない場合は作成
        const correlationSection = document.querySelector('#correlationSection .row');
        if (correlationSection) {
            const maeSection = document.createElement('div');
            maeSection.className = 'col-12 mt-4';
            maeSection.innerHTML = `
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>モデル性能評価 (MAE)</h5>
                    </div>
                    <div class="card-body">
                        <p class="mb-3">各モデルの平均絶対誤差（MAE）による性能評価結果です。値が小さいほど高性能です。</p>
                        <div id="maeResults"></div>
                    </div>
                </div>
            `;
            correlationSection.appendChild(maeSection);
        }
    }
    
    const maeContainer = document.getElementById('maeResults');
    if (!maeContainer) return;
    
    let html = '<div class="row">';
    
    Object.entries(maeData).forEach(([model, data]) => {
        const performanceClass = data.performance_level === '優秀' ? 'text-success' : 
                                data.performance_level === '良好' ? 'text-info' :
                                data.performance_level === '普通' ? 'text-warning' : 'text-danger';
        
        html += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">${model}</h6>
                    </div>
                    <div class="card-body text-center">
                        <h4 class="${performanceClass}">${data.mae.toFixed(4)}</h4>
                        <p class="mb-2"><span class="badge bg-secondary">${data.performance_level}</span></p>
                        <small class="text-muted">サンプル数: ${data.sample_size}件</small>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    maeContainer.innerHTML = html;
}

// モデル推奨結果を表示する関数
function displayModelRecommendation(recommendationData) {
    const container = document.getElementById('modelRecommendation');
    if (!container) {
        // コンテナが存在しない場合は作成
        const correlationSection = document.querySelector('#correlationSection .row');
        if (correlationSection) {
            const recSection = document.createElement('div');
            recSection.className = 'col-12 mt-4';
            recSection.innerHTML = `
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0"><i class="fas fa-trophy me-2"></i>推奨モデル判定</h5>
                    </div>
                    <div class="card-body">
                        <div id="modelRecommendation"></div>
                    </div>
                </div>
            `;
            correlationSection.appendChild(recSection);
        }
    }
    
    const recContainer = document.getElementById('modelRecommendation');
    if (!recContainer) return;
    
    let html = `
        <div class="alert alert-success mb-4">
            <h6><i class="fas fa-award me-2"></i>最適モデル: <strong>${recommendationData.recommended_model}</strong></h6>
            <p class="mb-0">${recommendationData.recommendation_reason}</p>
            <small>評価対象: ${recommendationData.sample_size}件のレビューデータ</small>
        </div>
        
        <h6>性能ランキング:</h6>
        <div class="row">
    `;
    
    recommendationData.rankings.forEach((ranking, index) => {
        const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        const cardClass = index === 0 ? 'border-warning' : index === 1 ? 'border-secondary' : 'border-light';
        
        html += `
            <div class="col-md-4 mb-3">
                <div class="card ${cardClass}">
                    <div class="card-body text-center">
                        <div class="h4">${rankIcon}</div>
                        <h6>${ranking.model}</h6>
                        <p class="mb-2">MAE: <strong>${ranking.mae.toFixed(4)}</strong></p>
                        <span class="badge bg-secondary">${ranking.performance_level}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    recContainer.innerHTML = html;
}

/**
 * モデル性能比較表を表示する関数 (復活)
 */
function displayModelComparisonTable(modelData) {
    const container = document.getElementById('modelComparisonTable');
    if (!container) {
        console.error('Model comparison table container not found');
        return;
    }
    
    console.log('📊 Displaying model comparison table with data:', modelData);
    
    // データが存在するかチェック
    if (!modelData || typeof modelData !== 'object') {
        console.error('No model comparison data available');
        container.innerHTML = '<p class="text-muted">モデル比較データがありません</p>';
        return;
    }
    
    try {
        // performance_metricsからMAE値を抽出
        console.log('Raw modelData:', modelData);
        
        const maeResults = {};
        // バックエンドのperformance_metricsからMAE値を抽出
        Object.entries(modelData).forEach(([key, value]) => {
            if (value && typeof value === 'object' && value.mae !== undefined) {
                maeResults[key] = value.mae;
            }
        });
        
        console.log('Extracted MAE results for table:', maeResults);
        
        if (!maeResults || Object.keys(maeResults).length === 0) {
            container.innerHTML = '<p class="text-muted">MAE結果が見つかりません</p>';
            return;
        }
        
        let html = `
            <div class="card mt-3">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0"><i class="fas fa-table me-2"></i>モデル性能比較表（MAE値）</h6>
                </div>
                <div class="card-body p-0">
                    <table class="table table-striped mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th>モデル</th>
                                <th>MAE値</th>
                                <th>性能ランク</th>
                                <th>評価</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // モデル名のマッピング
        const modelNames = {
            'cl-tohoku/bert-base-japanese-whole-word-masking': 'Koheiduck BERT',
            'llm-book/bert-base-japanese-v3': 'LLM-book BERT',
            'Mizuiro-sakura/luke-japanese-base-finetuned-vet': 'Mizuiro LUKE'
        };
        
        // MAEデータを配列に変換してソート
        const maeArray = [];
        Object.entries(maeResults).forEach(([model, mae]) => {
            maeArray.push({
                model: model,
                displayName: modelNames[model] || model,
                mae: parseFloat(mae) || 0
            });
        });
        
        // MAE値でソート（小さい順 = 良い順）
        maeArray.sort((a, b) => a.mae - b.mae);
        
        // テーブル行を生成
        maeArray.forEach((item, index) => {
            const rank = index + 1;
            const rankBadge = rank === 1 ? '<span class="badge bg-warning text-dark">1位</span>' :
                             rank === 2 ? '<span class="badge bg-secondary">2位</span>' :
                             '<span class="badge bg-light text-dark">3位</span>';
            
            const evaluation = item.mae < 0.5 ? '優秀' : 
                              item.mae < 1.0 ? '良好' : 
                              item.mae < 1.5 ? '標準' : '要改善';
            
            const evaluationClass = item.mae < 0.5 ? 'text-success' : 
                                   item.mae < 1.0 ? 'text-primary' : 
                                   item.mae < 1.5 ? 'text-warning' : 'text-danger';
            
            html += `
                <tr>
                    <td><strong>${item.displayName}</strong></td>
                    <td><code>${item.mae.toFixed(4)}</code></td>
                    <td>${rankBadge}</td>
                    <td><span class="${evaluationClass}">${evaluation}</span></td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                <div class="card-footer text-muted small">
                    <i class="fas fa-info-circle me-1"></i>
                    MAE（平均絶対誤差）: 値が小さいほど高性能。実際の星評価との差の平均値を示します。
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        console.log('✅ Model comparison table displayed successfully');
        
    } catch (error) {
        console.error('❌ Error displaying model comparison table:', error);
        container.innerHTML = `<div class="alert alert-danger">表示エラー: ${error.message}</div>`;
    }
}

/**
 * 星評価分布の円グラフを表示する関数 (復活)
 */
function displayStarRatingChart(starRatingData) {
    const canvas = document.getElementById('starRatingChart');
    if (!canvas) {
        console.error('Star rating chart canvas not found');
        return;
    }
    
    console.log('⭐ Displaying star rating chart with data:', starRatingData);
    
    // データが存在するかチェック
    if (!starRatingData || typeof starRatingData !== 'object') {
        console.error('No star rating distribution data available');
        return;
    }
    
    try {
        // Canvas直接描画で円グラフを作成
        const ctx = canvas.getContext('2d');
        
        // Canvas サイズを設定
        canvas.width = 400;
        canvas.height = 400;
        
        // 背景をクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // データを配列に変換
        const data = [];
        const labels = [];
        const colors = ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB'];
        
        // 1-5星の順序でデータを整理
        for (let star = 1; star <= 5; star++) {
            const count = starRatingData[star] || starRatingData[star.toString()] || 0;
            data.push(count);
            labels.push(`${star}つ星`);
        }
        
        console.log('Star rating chart data:', { data, labels });
        
        // データが全て0の場合
        const total = data.reduce((sum, val) => sum + val, 0);
        if (total === 0) {
            // 「データなし」を表示
            ctx.fillStyle = '#6c757d';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('星評価データなし', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // 円グラフを描画
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 30; // 凡例スペース確保
        const radius = 120;
        
        let currentAngle = -Math.PI / 2; // 12時から開始
        
        data.forEach((value, index) => {
            if (value > 0) {
                const sliceAngle = (value / total) * 2 * Math.PI;
                
                // パイスライスを描画
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = colors[index];
                ctx.fill();
                
                // 境界線を描画
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // パーセンテージテキストを描画
                const percentage = ((value / total) * 100).toFixed(1);
                if (parseFloat(percentage) > 5) { // 5%以上の場合のみ表示
                    const textAngle = currentAngle + sliceAngle / 2;
                    const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
                    const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
                    
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${percentage}%`, textX, textY);
                }
                
                currentAngle += sliceAngle;
            }
        });
        
        // 凡例を描画
        const legendY = centerY + radius + 40;
        const legendItemWidth = canvas.width / labels.length;
        
        labels.forEach((label, index) => {
            const count = data[index];
            if (count > 0) {
                const x = legendItemWidth * index + legendItemWidth / 2;
                
                // 色ボックス
                ctx.fillStyle = colors[index];
                ctx.fillRect(x - 40, legendY - 10, 15, 15);
                
                // テキスト
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${label}`, x - 20, legendY + 5);
                ctx.fillText(`(${count}件)`, x - 20, legendY + 18);
            }
        });
        
        // タイトルを描画
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('星評価分布', centerX, 25);
        
        console.log('✅ Star rating chart displayed successfully using Canvas');
        
    } catch (error) {
        console.error('❌ Error displaying star rating chart:', error);
        
        // エラー時は代替メッセージを表示
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#dc3545';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('チャート表示エラー', canvas.width / 2, canvas.height / 2);
        ctx.fillText(error.message, canvas.width / 2, canvas.height / 2 + 20);
    }
}

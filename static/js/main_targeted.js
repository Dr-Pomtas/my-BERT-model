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
    initializeApp();
});

function initializeApp() {
    // ファイルアップロード関連のイベントリスナー
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const runTestBtn = document.getElementById('runTestBtn');
    const downloadSampleBtn = document.getElementById('downloadSampleBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
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

    if (downloadSampleBtn) {
        downloadSampleBtn.addEventListener('click', downloadSample);
    }

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
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) return;
    
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
    fetch('/load_sample_data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                uploadedData = data.data;
                console.log('Sample data loaded:', uploadedData.length, 'records');
                
                // 修正: サンプルデータ状態の明確な表示
                showFileSelectionState('sample');
                document.getElementById('analyzeBtn').disabled = false;
            } else {
                alert('サンプルデータの読み込みに失敗しました: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Sample data loading error:', error);
            alert('サンプルデータの読み込みに失敗しました。');
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
        
        // モデル比較チャート - レスポンシブ設定追加
        console.log('📊 Displaying model comparison...', results.model_comparison);
        try {
            displayModelComparisonChart(results.model_comparison);
            console.log('✅ Model comparison chart displayed');
        } catch (e) {
            console.error('❌ Model comparison error:', e);
        }
        
        // 星評価分布チャート - サイズ調整
        console.log('⭐ Displaying star rating chart...', results.star_rating_distribution);
        try {
            displayStarRatingChart(results.star_rating_distribution);
            console.log('✅ Star rating chart displayed');
        } catch (e) {
            console.error('❌ Star rating chart error:', e);
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
    const ctx = document.getElementById('starRatingChart');
    if (!ctx) return;
    
    // 既存のチャートを破棄
    if (window.starChart && typeof window.starChart.destroy === 'function') {
        window.starChart.destroy();
    }
    
    // 修正: チャート表示の切れ問題 - レスポンシブ設定とアスペクト比調整
    window.starChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['★1', '★2', '★3', '★4', '★5'],
            datasets: [{
                label: 'レビュー数',
                data: [
                    starData['1'] || 0,
                    starData['2'] || 0,
                    starData['3'] || 0,
                    starData['4'] || 0,
                    starData['5'] || 0
                ],
                backgroundColor: [
                    '#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997'
                ],
                borderColor: [
                    '#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5, // 横長に調整
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(...Object.values(starData)) + 5, // データの最大値+5に変更
                    title: {
                        display: true,
                        text: '口コミ数'
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        stepSize: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '星評価'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: '星評価分布',
                    font: {
                        size: 14
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function(value, context) {
                        return value;
                    },
                    font: {
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

function displayModelComparisonChart(modelData) {
    const ctx = document.getElementById('modelChart');
    if (!ctx) return;
    
    // 既存のチャートを破棄
    if (window.modelChart && typeof window.modelChart.destroy === 'function') {
        window.modelChart.destroy();
    }
    
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
            
            // 散布図
            traces.push({
                x: data.star_ratings,
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
            
            // 回帰直線を計算
            const regression = calculateRegression(data.star_ratings, data.sentiment_scores);
            const xRange = [1, 2, 3, 4, 5];
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
            title: '星評価',
            range: [0.5, 5.5],
            dtick: 1
        },
        yaxis: { 
            title: '感情スコア',
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
    
    let html = '<div class="row">';
    
    Object.entries(hospitalData).forEach(([hospitalId, data]) => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">病院 ${hospitalId}</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>レビュー数:</strong> ${data.review_count}件</p>
                        <p><strong>平均星評価:</strong> ${data.avg_star_rating ? data.avg_star_rating.toFixed(2) : data.avg_rating.toFixed(2)}点</p>
                        <p><strong>感情スコア平均:</strong> ${data.avg_sentiment.toFixed(3)}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function downloadSample() {
    window.location.href = '/download_sample';
}

function exportResults() {
    if (!analysisResults) {
        alert('エクスポートする結果がありません。まず分析を実行してください。');
        return;
    }
    
    console.log('📤 Exporting results...');
    
    try {
        // CSV形式でダウンロード
        window.location.href = '/export_results';
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
    
    // 相関係数の取得と解釈
    const correlationStrengths = [];
    Object.entries(correlations).forEach(([model, data]) => {
        const correlation = data.correlation || 0;
        correlationStrengths.push({ model, correlation, strength: getCorrelationStrength(correlation) });
    });
    
    // 最強・最弱の相関を特定
    const strongestCorrelation = correlationStrengths.reduce((a, b) => 
        Math.abs(a.correlation) > Math.abs(b.correlation) ? a : b
    );
    const weakestCorrelation = correlationStrengths.reduce((a, b) => 
        Math.abs(a.correlation) < Math.abs(b.correlation) ? a : b
    );
    
    // 性能テスト結果の解釈
    const significantDifferences = [];
    const nonSignificantDifferences = [];
    
    Object.entries(performanceTests).forEach(([comparison, data]) => {
        if (data.significant) {
            significantDifferences.push({ comparison, mae_diff: data.mae_difference });
        } else {
            nonSignificantDifferences.push({ comparison, mae_diff: data.mae_difference });
        }
    });
    
    // MAE値による性能ランキング
    const modelPerformance = aggregatedData.length > 0 ? [
        { name: 'Model A (Koheiduck)', mae: calculateMAE(aggregatedData, 'Model A (Koheiduck)_score', 'star_score') },
        { name: 'Model B (LLM-book)', mae: calculateMAE(aggregatedData, 'Model B (LLM-book)_score', 'star_score') },
        { name: 'Model C (Mizuiro)', mae: calculateMAE(aggregatedData, 'Model C (Mizuiro)_score', 'star_score') }
    ].sort((a, b) => a.mae - b.mae) : [];
    
    // 解釈テキストの生成
    let interpretationHTML = `
        <div class="alert alert-info mb-4">
            <h6><i class="fas fa-info-circle me-2"></i>分析概要</h6>
            <p class="mb-2">本分析では、${hospitalCount}件の獣医病院から収集された${totalReviews}件のレビューデータを用いて、
            3つの日本語BERT感情分析モデルの性能比較を実施しました。</p>
            <p class="mb-0">平均評価: ${avgRating.toFixed(2)}点、分析対象期間のレビューを正規化星評価(-3〜+2)で評価しています。</p>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0"><i class="fas fa-trophy me-2"></i>モデル性能ランキング</h6>
                    </div>
                    <div class="card-body">
    `;
    
    if (modelPerformance.length > 0) {
        modelPerformance.forEach((model, index) => {
            const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
            const performanceLevel = model.performance_level || (model.mae < 0.5 ? '優秀' : model.mae < 1.0 ? '良好' : model.mae < 1.5 ? '普通' : '要改善');
            
            interpretationHTML += `
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span>${rankIcon} ${model.name.split('(')[1]?.replace(')', '') || model.name}</span>
                            <span class="badge bg-secondary">MAE: ${model.mae.toFixed(4)} (${performanceLevel})</span>
                        </div>
            `;
        });
    } else {
        interpretationHTML += '<p>性能データを計算中...</p>';
    }
    
    interpretationHTML += `
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0"><i class="fas fa-link me-2"></i>相関分析結果</h6>
                    </div>
                    <div class="card-body">
    `;
    
    if (correlationStrengths.length > 0) {
        interpretationHTML += `
                        <div class="mb-3">
                            <strong>最強相関:</strong> ${strongestCorrelation.model}<br>
                            <span class="text-primary">r = ${strongestCorrelation.correlation.toFixed(4)} (${strongestCorrelation.strength})</span>
                        </div>
                        <div class="mb-2">
                            <strong>最弱相関:</strong> ${weakestCorrelation.model}<br>
                            <span class="text-secondary">r = ${weakestCorrelation.correlation.toFixed(4)} (${weakestCorrelation.strength})</span>
                        </div>
        `;
    } else {
        interpretationHTML += '<p>相関データを計算中...</p>';
    }
    
    interpretationHTML += `
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card border-warning mb-4">
            <div class="card-header bg-warning text-dark">
                <h6 class="mb-0"><i class="fas fa-chart-bar me-2"></i>統計的有意性検定</h6>
            </div>
            <div class="card-body">
    `;
    
    if (significantDifferences.length > 0) {
        interpretationHTML += `
                <div class="alert alert-danger mb-3">
                    <strong>有意な性能差が検出されました:</strong>
                    <ul class="mb-0 mt-2">
        `;
        significantDifferences.forEach(diff => {
            const [model1, model2] = diff.comparison.split('_vs_');
            const betterModel = diff.mae_diff > 0 ? model2 : model1;
            interpretationHTML += `<li>${model1} vs ${model2}: ${betterModel}が優位 (差分: ${Math.abs(diff.mae_diff).toFixed(4)})</li>`;
        });
        interpretationHTML += `
                    </ul>
                </div>
        `;
    }
    
    if (nonSignificantDifferences.length > 0) {
        interpretationHTML += `
                <div class="alert alert-success mb-3">
                    <strong>統計的に有意でない比較:</strong> ${nonSignificantDifferences.length}件<br>
                    <small>これらのモデル間では実質的な性能差は認められません。</small>
                </div>
        `;
    }
    
    interpretationHTML += `
            </div>
        </div>
        
        <div class="card border-info">
            <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="fas fa-lightbulb me-2"></i>実用性評価と推奨事項</h6>
            </div>
            <div class="card-body">
                <h6>📋 推奨される活用方法:</h6>
                <ul>
    `;
    
    // 推奨事項の生成
    if (modelPerformance.length > 0 && modelPerformance[0].mae < 1.0) {
        interpretationHTML += modelRecommendation.recommended_model ? \n            `<li><strong>📊 システム推奨モデル:</strong> ${modelRecommendation.recommended_model} - ${modelRecommendation.recommendation_reason}</li>` :\n            `<li><strong>高精度分析:</strong> ${modelPerformance[0].name}は最も優秀な性能を示しており、重要な意思決定に推奨</li>`;
    }
    
    if (strongestCorrelation && Math.abs(strongestCorrelation.correlation) > 0.7) {
        interpretationHTML += `<li><strong>感情予測:</strong> ${strongestCorrelation.model}は星評価との強い相関を示し、顧客満足度予測に有効</li>`;
    }
    
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
                row[header] = values[index];
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

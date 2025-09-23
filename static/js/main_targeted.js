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
                        <button class="btn btn-outline-info btn-sm" onclick="showDataPreview()">
                            <i class="fas fa-eye me-1"></i>データプレビュー
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
                        <button class="btn btn-outline-info btn-sm" onclick="showDataPreview()">
                            <i class="fas fa-eye me-1"></i>データプレビュー
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

function showDataPreview() {
    if (!uploadedData) return;
    
    let preview = "データプレビュー (最初の5件):\\n\\n";
    const headers = Object.keys(uploadedData[0]);
    preview += headers.join(", ") + "\\n";
    
    for (let i = 0; i < Math.min(5, uploadedData.length); i++) {
        const row = uploadedData[i];
        preview += headers.map(h => row[h]).join(", ") + "\\n";
    }
    
    alert(preview);
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
        console.log('Displaying basic stats...');
        displayBasicStats(results.basic_stats);
        
        // モデル比較チャート - レスポンシブ設定追加
        console.log('Displaying model comparison...');
        displayModelComparisonChart(results.model_comparison);
        
        // 星評価分布チャート - サイズ調整
        console.log('Displaying star rating chart...');
        displayStarRatingChart(results.star_rating_distribution);
        
        // 相関行列 - レスポンシブ対応
        console.log('Displaying correlation matrix...');
        displayCorrelationMatrix(results.correlation_matrix);
        
        // 病院別分析
        console.log('Displaying hospital analysis...');
        displayHospitalAnalysis(results.hospital_analysis);
        
        console.log('All charts displayed successfully');
        
    } catch (error) {
        console.error('Error in displayAnalysisResults:', error);
        showProgressIndicator('error', 'チャート表示エラー');
    }
}

function displayStarRatingChart(starData) {
    const ctx = document.getElementById('starRatingChart');
    if (!ctx) return;
    
    // 既存のチャートを破棄
    if (window.starChart) {
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
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        }
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
    if (window.modelChart) {
        window.modelChart.destroy();
    }
    
    const models = Object.keys(modelData);
    const maeScores = models.map(model => modelData[model].mae_score);
    
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

function displayCorrelationMatrix(correlationData) {
    currentCorrelationData = correlationData;
    
    const models = Object.keys(correlationData);
    const matrix = models.map(model1 => 
        models.map(model2 => correlationData[model1][model2])
    );
    
    // 修正: Plotlyチャートのレスポンシブ設定
    const data = [{
        z: matrix,
        x: models.map(m => m.replace('cl-tohoku/', '').replace('/bert-base-japanese', '')),
        y: models.map(m => m.replace('cl-tohoku/', '').replace('/bert-base-japanese', '')),
        type: 'heatmap',
        colorscale: 'RdBu',
        zmin: -1,
        zmax: 1,
        text: matrix.map(row => row.map(val => val.toFixed(3))),
        texttemplate: "%{text}",
        textfont: {"size": 12},
        hoverongaps: false
    }];
    
    const layout = {
        title: 'モデル間相関行列',
        xaxis: { title: 'モデル' },
        yaxis: { title: 'モデル' },
        autosize: true,
        margin: { l: 80, r: 40, t: 80, b: 80 }
    };
    
    const config = {
        responsive: true,
        displayModeBar: true
    };
    
    Plotly.newPlot('correlationMatrix', data, layout, config);
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
                        <p class="card-text">平均評価</p>
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
                        <p><strong>レビュー数:</strong> ${data.review_count}</p>
                        <p><strong>平均評価:</strong> ${data.avg_rating.toFixed(2)}</p>
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
// メイン JavaScript ファイル
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const exportBtn = document.getElementById('exportBtn');
    const dataStats = document.getElementById('dataStats');
    const analysisProgress = document.getElementById('analysisProgress');
    const resultsSection = document.getElementById('resultsSection');
    
    // 統計検定関連の要素
    const model1Select = document.getElementById('model1Select');
    const model2Select = document.getElementById('model2Select');
    const statisticalTestBtn = document.getElementById('statisticalTestBtn');
    const testProgress = document.getElementById('testProgress');
    const testResults = document.getElementById('testResults');

    let starDistributionChart = null;

    // ファイルアップロード関連
    fileInput.addEventListener('change', handleFileSelect);
    
    // ドラッグ&ドロップ
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());

    // 分析実行
    analyzeBtn.addEventListener('click', runAnalysis);
    
    // エクスポート
    exportBtn.addEventListener('click', exportResults);
    
    // 統計検定
    const runTestBtn = document.getElementById('runTestBtn');
    if (runTestBtn) {
        runTestBtn.addEventListener('click', runStatisticalTest);
    }
    
    // サンプルデータ
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const downloadSampleBtn = document.getElementById('downloadSampleBtn');
    
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', loadSampleData);
    }
    
    if (downloadSampleBtn) {
        downloadSampleBtn.addEventListener('click', downloadSampleData);
    }
    
    // 統計検定
    statisticalTestBtn.addEventListener('click', runStatisticalTest);
    model1Select.addEventListener('change', validateTestInputs);
    model2Select.addEventListener('change', validateTestInputs);

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    }

    function handleFileSelect() {
        const file = fileInput.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            showAlert('CSVファイルを選択してください。', 'error');
            return;
        }

        // ファイル情報表示
        showFileInfo(file);
        
        // ファイルをアップロード
        uploadFile(file);
    }

    function showFileInfo(file) {
        const fileSize = (file.size / 1024).toFixed(1);
        uploadArea.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-csv fa-2x text-success mb-2"></i>
                <div class="file-name">${file.name}</div>
                <div class="text-muted">サイズ: ${fileSize} KB</div>
            </div>
        `;
    }

    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        showAlert('ファイルをアップロード中...', 'info');

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('ファイルのアップロードが完了しました！', 'success');
                displayStats(data.stats);
                analyzeBtn.disabled = false;
            } else {
                showAlert(data.error, 'error');
            }
        })
        .catch(error => {
            showAlert('アップロードエラー: ' + error.message, 'error');
        });
    }

    function displayStats(stats) {
        console.log('受信した統計データ:', stats);
        
        document.getElementById('totalReviews').textContent = stats.total_reviews.toLocaleString();
        document.getElementById('uniqueHospitals').textContent = stats.unique_hospitals.toLocaleString();
        document.getElementById('avgStarRating').textContent = stats.avg_star_rating.toFixed(2);
        
        // 星評価分布チャート
        createStarDistributionChart(stats.star_distribution);
        
        dataStats.classList.remove('d-none');
        dataStats.classList.add('fade-in');
        
        console.log(`表示された統計: 口コミ数=${stats.total_reviews}, 病院数=${stats.unique_hospitals}`);
    }

    function createStarDistributionChart(distribution) {
        const ctx = document.getElementById('starDistributionChart').getContext('2d');
        
        if (starDistributionChart) {
            starDistributionChart.destroy();
        }

        starDistributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1星', '2星', '3星', '4星', '5星'],
                datasets: [{
                    label: '口コミ数',
                    data: [
                        distribution[1] || 0,
                        distribution[2] || 0,
                        distribution[3] || 0,
                        distribution[4] || 0,
                        distribution[5] || 0
                    ],
                    backgroundColor: [
                        '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#007bff'
                    ],
                    borderColor: [
                        '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#007bff'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 10,
                        right: 10
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '星評価分布',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `口コミ数: ${context.parsed.y}件`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: '口コミ数',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12
                            }
                        },
                        title: {
                            display: true,
                            text: '星評価',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                },
                // データラベルを表示
                onHover: function(event, activeElements) {
                    event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                }
            },
            plugins: [{
                id: 'datalabels',
                afterDatasetsDraw: function(chart) {
                    const ctx = chart.ctx;
                    chart.data.datasets.forEach((dataset, i) => {
                        const meta = chart.getDatasetMeta(i);
                        meta.data.forEach((bar, index) => {
                            const data = dataset.data[index];
                            if (data > 0) {
                                ctx.fillStyle = '#000';
                                ctx.font = 'bold 12px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                ctx.fillText(data + '件', bar.x, bar.y - 5);
                            }
                        });
                    });
                }
            }]
        });
    }

    function runAnalysis() {
        analyzeBtn.disabled = true;
        analysisProgress.classList.remove('d-none');
        
        // プログレステキストの更新
        let progressSteps = [
            '📋 データ前処理中...',
            '🤖 Model A で感情分析中...',
            '🤖 Model B で感情分析中...',
            '🤖 Model C で感情分析中...',
            '🏥 病院単位での集計中...',
            '📊 パフォーマンス評価中...',
            '📈 相関分析実行中...',
            '✅ 分析完了！結果を準備中...'
        ];
        
        let stepIndex = 0;
        const progressInterval = setInterval(() => {
            if (stepIndex < progressSteps.length) {
                document.getElementById('progressText').innerHTML = progressSteps[stepIndex];
                stepIndex++;
            }
        }, 3000); // 少し長めの間隔で進行感を演出

        fetch('/analyze', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            
            if (data.success) {
                showAlert(`分析が完了しました！${data.hospital_count}病院のデータを処理しました。`, 'success');
                analysisProgress.classList.add('d-none');
                loadCharts();
            } else {
                showAlert(data.error, 'error');
                analyzeBtn.disabled = false;
                analysisProgress.classList.add('d-none');
            }
        })
        .catch(error => {
            clearInterval(progressInterval);
            showAlert('分析エラー: ' + error.message, 'error');
            analyzeBtn.disabled = false;
            analysisProgress.classList.add('d-none');
        });
    }

    function loadCharts() {
        fetch('/get_charts')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
                return;
            }

            console.log('チャートデータを受信:', data);

            // チャートを描画
            Plotly.newPlot('correlationChart', JSON.parse(data.correlation_chart).data, JSON.parse(data.correlation_chart).layout, {responsive: true});
            Plotly.newPlot('maeChart', JSON.parse(data.mae_chart).data, JSON.parse(data.mae_chart).layout, {responsive: true});
            
            // 散布図
            data.scatter_charts.forEach((chartData, index) => {
                const chartId = `scatterChart${index + 1}`;
                const chart = JSON.parse(chartData);
                console.log(`散布図${index + 1}のデータ:`, chart);
                Plotly.newPlot(chartId, chart.data, chart.layout, {responsive: true});
            });

            // 統計検定用のUIを設定
            setupStatisticalTestUI(data);

            // 統計検定セクションを表示
            const statisticalTestSection = document.getElementById('statisticalTestSection');
            if (statisticalTestSection) {
                statisticalTestSection.style.display = 'block';
            }

            resultsSection.style.display = 'block';
            resultsSection.classList.add('fade-in');
        })
        .catch(error => {
            showAlert('チャート読み込みエラー: ' + error.message, 'error');
        });
    }

    function setupModelSelects(performanceMetrics) {
        // モデルをMAEの昇順でソート
        const sortedModels = Object.entries(performanceMetrics)
            .sort((a, b) => a[1].mae - b[1].mae)
            .map(entry => entry[0]);
        
        console.log('MAE順ソート結果:', sortedModels);
        
        // 選択肢をクリア
        model1Select.innerHTML = '<option value="">モデルを選択...</option>';
        model2Select.innerHTML = '<option value="">モデルを選択...</option>';
        
        // 全モデルを選択肢に追加
        sortedModels.forEach(modelName => {
            const option1 = new Option(modelName, modelName);
            const option2 = new Option(modelName, modelName);
            model1Select.add(option1);
            model2Select.add(option2);
        });
        
        // デフォルト設定：MAEが最も小さいモデルと2番目に小さいモデルを選択
        if (sortedModels.length >= 2) {
            model1Select.value = sortedModels[0]; // 最も良いモデル
            model2Select.value = sortedModels[1]; // 2番目に良いモデル
            validateTestInputs();
        }
    }

    function validateTestInputs() {
        const model1 = model1Select.value;
        const model2 = model2Select.value;
        
        if (model1 && model2 && model1 !== model2) {
            statisticalTestBtn.disabled = false;
        } else {
            statisticalTestBtn.disabled = true;
        }
    }

    function runStatisticalTest() {
        const model1 = model1Select.value;
        const model2 = model2Select.value;
        
        if (!model1 || !model2 || model1 === model2) {
            showAlert('異なる2つのモデルを選択してください', 'error');
            return;
        }
        
        // UI更新
        statisticalTestBtn.disabled = true;
        testProgress.classList.remove('d-none');
        testResults.classList.add('d-none');
        
        // プログレスバー更新
        updateTestProgress(0, 'ブートストラップ法による検定を開始...');
        
        // 検定実行
        fetch('/statistical_test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model1: model1,
                model2: model2
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayTestResults(data.result);
            } else {
                showAlert(data.error, 'error');
            }
        })
        .catch(error => {
            showAlert('統計検定エラー: ' + error.message, 'error');
        })
        .finally(() => {
            statisticalTestBtn.disabled = false;
            testProgress.classList.add('d-none');
        });
    }

    function updateTestProgress(percent, text) {
        document.getElementById('testProgressText').textContent = text;
        document.getElementById('testProgressBar').style.width = percent + '%';
    }

    function displayTestResults(result) {
        const isSignificant = result.confidence_interval[0] > 0 || result.confidence_interval[1] < 0;
        
        const resultHTML = `
            <div class="test-result-item">
                <span class="test-result-label">比較対象:</span>
                <span class="test-result-value">${result.model1} vs ${result.model2}</span>
            </div>
            
            <div class="row mt-3">
                <div class="col-md-6">
                    <div class="test-result-item">
                        <span class="test-result-label">${result.model1}のMAE:</span>
                        <span class="test-result-value">${result.mae1.toFixed(4)}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="test-result-item">
                        <span class="test-result-label">${result.model2}のMAE:</span>
                        <span class="test-result-value">${result.mae2.toFixed(4)}</span>
                    </div>
                </div>
            </div>
            
            <div class="test-result-item mt-3">
                <span class="test-result-label">MAEの差の95%信頼区間:</span>
                <span class="confidence-interval">[${result.confidence_interval[0].toFixed(4)}, ${result.confidence_interval[1].toFixed(4)}]</span>
            </div>
            
            <div class="conclusion ${isSignificant ? 'significant' : 'not-significant'}">
                <i class="fas ${isSignificant ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2"></i>
                ${isSignificant ? 
                    '2つのモデルの性能差は、統計的に95%の信頼水準で有意です。' : 
                    '2つのモデルの性能差は、統計的に有意であるとは言えません。'}
            </div>
            
            <div class="mt-3 small text-muted">
                <i class="fas fa-info-circle me-1"></i>
                ブートストラップ回数: ${result.bootstrap_iterations.toLocaleString()}回
            </div>
        `;
        
        document.getElementById('testResultContent').innerHTML = resultHTML;
        
        // 結果ボックスのスタイリング
        const resultBox = document.querySelector('.result-box');
        resultBox.className = `result-box ${isSignificant ? 'significant' : 'not-significant'}`;
        
        testResults.classList.remove('d-none');
        testResults.classList.add('fade-in');
    }

    function exportResults() {
        window.location.href = '/export_results';
    }

    function showAlert(message, type) {
        // 既存のアラートを削除
        const existingAlert = document.querySelector('.alert-dismissible');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertClass = type === 'error' ? 'alert-danger' : 
                          type === 'success' ? 'alert-success' : 
                          'alert-info';
        
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : 
                    type === 'success' ? 'fas fa-check-circle' : 
                    'fas fa-info-circle';

        const alertHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="${icon} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // アップロードエリアの後に追加
        uploadArea.insertAdjacentHTML('afterend', alertHTML);

        // 5秒後に自動削除（エラー以外）
        if (type !== 'error') {
            setTimeout(() => {
                const alert = document.querySelector('.alert-dismissible');
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 5000);
        }
    }

    function setupStatisticalTestUI(data) {
        const model1Select = document.getElementById('model1Select');
        const model2Select = document.getElementById('model2Select');
        
        if (!model1Select || !model2Select) {
            console.error('統計検定のプルダウンメニューが見つかりません');
            return;
        }

        // ドロップダウンをクリア
        model1Select.innerHTML = '<option value="">選択してください</option>';
        model2Select.innerHTML = '<option value="">選択してください</option>';

        // モデルリストを追加
        if (data.model_list && data.model_list.length > 0) {
            data.model_list.forEach(model => {
                const option1 = document.createElement('option');
                option1.value = model;
                option1.textContent = model;
                model1Select.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = model;
                option2.textContent = model;
                model2Select.appendChild(option2);
            });

            // デフォルト選択（MAEが最も小さいモデルと2番目に小さいモデル）
            if (data.best_model) {
                model1Select.value = data.best_model;
                console.log(`モデル1にデフォルト設定: ${data.best_model}`);
            }
            if (data.second_best_model) {
                model2Select.value = data.second_best_model;
                console.log(`モデル2にデフォルト設定: ${data.second_best_model}`);
            }

            console.log(`統計検定UI設定完了: モデル1=${data.best_model}, モデル2=${data.second_best_model}`);
        } else {
            console.error('モデルリストが空です:', data);
        }
    }

    function runStatisticalTest() {
        const model1Select = document.getElementById('model1Select');
        const model2Select = document.getElementById('model2Select');
        const testProgress = document.getElementById('testProgress');
        const testResults = document.getElementById('testResults');
        const runTestBtn = document.getElementById('runTestBtn');

        const model1 = model1Select.value;
        const model2 = model2Select.value;

        if (!model1 || !model2) {
            showAlert('両方のモデルを選択してください。', 'error');
            return;
        }

        if (model1 === model2) {
            showAlert('異なるモデルを選択してください。', 'error');
            return;
        }

        // UI状態更新
        runTestBtn.disabled = true;
        testProgress.classList.remove('d-none');
        testResults.classList.add('d-none');

        // 検定実行
        fetch('/statistical_test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model1: model1,
                model2: model2
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
                return;
            }

            displayTestResults(data);
        })
        .catch(error => {
            showAlert('統計検定エラー: ' + error.message, 'error');
        })
        .finally(() => {
            runTestBtn.disabled = false;
            testProgress.classList.add('d-none');
        });
    }

    function displayTestResults(data) {
        const testResults = document.getElementById('testResults');
        const comparisonModels = document.getElementById('comparisonModels');
        const maeResults = document.getElementById('maeResults');
        const confidenceInterval = document.getElementById('confidenceInterval');
        const significanceResult = document.getElementById('significanceResult');

        // 結果表示
        comparisonModels.textContent = `${data.model1} vs ${data.model2}`;
        
        maeResults.innerHTML = `
            ${data.model1}: ${data.mae1.toFixed(4)}<br>
            ${data.model2}: ${data.mae2.toFixed(4)}<br>
            MAE差: ${data.mae_difference.toFixed(4)}
        `;

        confidenceInterval.textContent = `[${data.ci_lower.toFixed(4)}, ${data.ci_upper.toFixed(4)}]`;

        // 有意性の判定と表示
        if (data.is_significant) {
            significanceResult.innerHTML = `
                <div class="significance-significant">
                    <i class="fas fa-check-circle me-2"></i>
                    2つのモデルの性能差は、統計的に95%の信頼水準で有意です。
                </div>
            `;
        } else {
            significanceResult.innerHTML = `
                <div class="significance-not-significant">
                    <i class="fas fa-times-circle me-2"></i>
                    2つのモデルの性能差は、統計的に有意であるとは言えません。
                </div>
            `;
        }

        testResults.classList.remove('d-none');
        testResults.classList.add('fade-in-result');

        console.log('検定結果を表示:', data);
    }

    function loadSampleData() {
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        
        // ボタンを無効化してローディング状態に
        loadSampleBtn.disabled = true;
        loadSampleBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>読み込み中...';
        
        fetch('/load_sample', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('サンプルデータを正常に読み込みました！', 'success');
                displayStats(data.stats);
                
                // アップロードエリアを成功状態に変更（ファイル選択要素は非表示）
                uploadArea.classList.add('sample-success');
                uploadArea.innerHTML = `
                    <div class="sample-loaded">
                        <i class="fas fa-check-circle fa-2x text-success mb-3"></i>
                        <h5><strong>サンプルデータ読み込み完了</strong></h5>
                        <div class="mt-2">
                            <div class="alert alert-success mb-0">
                                <strong>動物病院口コミサンプル</strong><br>
                                📊 ${data.stats.total_reviews}件の口コミ | 🏥 ${data.stats.unique_hospitals}病院<br>
                                ⭐ 平均評価: ${data.stats.avg_star_rating.toFixed(2)}
                            </div>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-outline-primary btn-sm" onclick="location.reload()">
                                <i class="fas fa-refresh me-1"></i>別のファイルを使用
                            </button>
                        </div>
                    </div>
                `;
                
                // 分析ボタンを有効化
                analyzeBtn.disabled = false;
                
            } else {
                showAlert(data.error, 'error');
            }
        })
        .catch(error => {
            showAlert('サンプルデータの読み込みエラー: ' + error.message, 'error');
        })
        .finally(() => {
            // ボタンを元に戻す
            loadSampleBtn.disabled = false;
            loadSampleBtn.innerHTML = '<i class="fas fa-download me-1"></i>サンプル使用';
        });
    }

    function downloadSampleData() {
        // サンプルファイルのダウンロード
        window.location.href = '/download_sample';
        showAlert('サンプルCSVファイルのダウンロードを開始しました。', 'info');
    }
});
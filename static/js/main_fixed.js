// メイン JavaScript ファイル（修正版）
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const exportBtn = document.getElementById('exportBtn');
    const dataStats = document.getElementById('dataStats');
    const analysisProgress = document.getElementById('analysisProgress');
    const resultsSection = document.getElementById('resultsSection');

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
        const ctx = document.getElementById('starDistributionChart');
        if (!ctx) return;
        
        if (starDistributionChart) {
            starDistributionChart.destroy();
        }

        starDistributionChart = new Chart(ctx.getContext('2d'), {
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
                maintainAspectRatio: true,
                aspectRatio: 2,
                layout: {
                    padding: {
                        top: 30,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '星評価分布',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
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
                                ctx.fillStyle = '#333';
                                ctx.font = 'bold 14px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                ctx.fillText(data + '件', bar.x, bar.y - 8);
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
            '📋 データ前処理を開始しています...',
            '🤖 Model A (Koheiduck) で感情分析実行中...',
            '🤖 Model B (LLM-book) で感情分析実行中...',
            '🤖 Model C (Mizuiro) で感情分析実行中...',
            '🏥 病院単位での集計を行っています...',
            '📊 性能評価指標を計算中...',
            '📈 相関分析と信頼区間を算出中...',
            '✅ 分析完了！結果を準備しています...'
        ];
        
        let stepIndex = 0;
        const progressInterval = setInterval(() => {
            const progressElement = document.getElementById('progressText');
            if (progressElement && stepIndex < progressSteps.length) {
                progressElement.innerHTML = progressSteps[stepIndex];
                stepIndex++;
            }
        }, 4000);

        fetch('/analyze', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            
            if (data.success) {
                showAlert(`✅ 分析が完了しました！${data.hospital_count}病院のデータを処理しました。`, 'success');
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

            try {
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
                    console.log('統計検定セクションを表示しました');
                } else {
                    console.error('統計検定セクションが見つかりません');
                }

                resultsSection.style.display = 'block';
                resultsSection.classList.add('fade-in');
                
            } catch (error) {
                console.error('チャート描画エラー:', error);
                showAlert('チャート描画でエラーが発生しました: ' + error.message, 'error');
            }
        })
        .catch(error => {
            showAlert('チャート読み込みエラー: ' + error.message, 'error');
        });
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

        console.log('受信したデータ:', data);

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

            // デフォルト選択
            if (data.best_model) {
                model1Select.value = data.best_model;
                console.log(`モデル1にデフォルト設定: ${data.best_model}`);
            }
            if (data.second_best_model) {
                model2Select.value = data.second_best_model;
                console.log(`モデル2にデフォルト設定: ${data.second_best_model}`);
            }

            console.log(`統計検定UI設定完了`);
        } else {
            console.error('モデルリストが空またはundefinedです:', data);
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

        console.log(`統計検定開始: ${model1} vs ${model2}`);

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

            console.log('統計検定結果を受信:', data);
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
            <strong>${data.model1}:</strong> ${data.mae1.toFixed(4)}<br>
            <strong>${data.model2}:</strong> ${data.mae2.toFixed(4)}<br>
            <strong>MAE差:</strong> ${data.mae_difference.toFixed(4)}
        `;

        confidenceInterval.innerHTML = `<strong>[${data.ci_lower.toFixed(4)}, ${data.ci_upper.toFixed(4)}]</strong>`;

        // 有意性の判定と表示
        if (data.is_significant) {
            significanceResult.innerHTML = `
                <div class="significance-significant">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>2つのモデルの性能差は、統計的に95%の信頼水準で有意です。</strong>
                </div>
            `;
        } else {
            significanceResult.innerHTML = `
                <div class="significance-not-significant">
                    <i class="fas fa-times-circle me-2"></i>
                    <strong>2つのモデルの性能差は、統計的に有意であるとは言えません。</strong>
                </div>
            `;
        }

        testResults.classList.remove('d-none');
        testResults.classList.add('fade-in-result');

        console.log('検定結果を表示しました');
    }

    function loadSampleData() {
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        
        loadSampleBtn.disabled = true;
        loadSampleBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>読み込み中...';
        
        fetch('/load_sample', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('✅ サンプルデータを正常に読み込みました！', 'success');
                displayStats(data.stats);
                
                // アップロードエリアを成功状態に変更（ファイル選択要素は非表示）
                uploadArea.classList.add('sample-success');
                uploadArea.innerHTML = `
                    <div class="sample-loaded p-4">
                        <i class="fas fa-check-circle fa-2x text-success mb-3"></i>
                        <h5><strong>サンプルデータ読み込み完了</strong></h5>
                        <div class="alert alert-success mt-3 mb-0">
                            <strong>📊 動物病院口コミサンプル</strong><br>
                            口コミ数: <strong>${data.stats.total_reviews}件</strong> | 
                            病院数: <strong>${data.stats.unique_hospitals}病院</strong><br>
                            平均評価: <strong>⭐ ${data.stats.avg_star_rating.toFixed(2)}</strong>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-outline-primary btn-sm" onclick="location.reload()">
                                <i class="fas fa-refresh me-1"></i>別のファイルを使用
                            </button>
                        </div>
                    </div>
                `;
                
                analyzeBtn.disabled = false;
                
            } else {
                showAlert(data.error, 'error');
            }
        })
        .catch(error => {
            showAlert('サンプルデータの読み込みエラー: ' + error.message, 'error');
        })
        .finally(() => {
            loadSampleBtn.disabled = false;
            loadSampleBtn.innerHTML = '<i class="fas fa-download me-1"></i>サンプル使用';
        });
    }

    function downloadSampleData() {
        window.location.href = '/download_sample';
        showAlert('📥 サンプルCSVファイルのダウンロードを開始しました。', 'info');
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
});
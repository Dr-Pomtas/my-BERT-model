// メイン JavaScript ファイル
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
        document.getElementById('totalReviews').textContent = stats.total_reviews.toLocaleString();
        document.getElementById('uniqueHospitals').textContent = stats.unique_hospitals.toLocaleString();
        document.getElementById('avgStarRating').textContent = stats.avg_star_rating.toFixed(2);
        
        // 星評価分布チャート
        createStarDistributionChart(stats.star_distribution);
        
        dataStats.classList.remove('d-none');
        dataStats.classList.add('fade-in');
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
                plugins: {
                    title: {
                        display: true,
                        text: '星評価分布'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '口コミ数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '星評価'
                        }
                    }
                }
            }
        });
    }

    function runAnalysis() {
        analyzeBtn.disabled = true;
        analysisProgress.classList.remove('d-none');
        
        // プログレステキストの更新
        let progressSteps = [
            'データ前処理中...',
            'モデル A で分析中...',
            'モデル B で分析中...',
            'モデル C で分析中...',
            '病院単位での集計中...',
            'パフォーマンス評価中...'
        ];
        
        let stepIndex = 0;
        const progressInterval = setInterval(() => {
            if (stepIndex < progressSteps.length) {
                document.getElementById('progressText').textContent = progressSteps[stepIndex];
                stepIndex++;
            }
        }, 2000);

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

            // チャートを描画
            Plotly.newPlot('correlationChart', JSON.parse(data.correlation_chart).data, JSON.parse(data.correlation_chart).layout, {responsive: true});
            Plotly.newPlot('maeChart', JSON.parse(data.mae_chart).data, JSON.parse(data.mae_chart).layout, {responsive: true});
            
            // 散布図
            data.scatter_charts.forEach((chartData, index) => {
                const chartId = `scatterChart${index + 1}`;
                const chart = JSON.parse(chartData);
                Plotly.newPlot(chartId, chart.data, chart.layout, {responsive: true});
            });

            resultsSection.style.display = 'block';
            resultsSection.classList.add('fade-in');
        })
        .catch(error => {
            showAlert('チャート読み込みエラー: ' + error.message, 'error');
        });
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
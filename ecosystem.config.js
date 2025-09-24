// PM2 Ecosystem Configuration for 動物病院口コミ分析システム
module.exports = {
  apps: [{
    name: 'vet-review-analysis',
    script: 'app.py',
    interpreter: 'python3',
    cwd: '/home/user/webapp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      FLASK_ENV: 'production',
      PYTHONPATH: '/home/user/webapp'
    },
    env_development: {
      NODE_ENV: 'development',
      FLASK_ENV: 'development',
      FLASK_DEBUG: 'True'
    },
    log_file: '/home/user/webapp/logs/combined.log',
    out_file: '/home/user/webapp/logs/out.log',
    error_file: '/home/user/webapp/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
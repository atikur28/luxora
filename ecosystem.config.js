module.exports = {
  apps: [
    {
      name: 'final-year-project',
      script: 'npm',
      args: 'run start',
      cwd: '/var/www/final-year-project',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4007,
      },
      error_file: '/var/www/final-year-project/logs/err.log',
      out_file: '/var/www/final-year-project/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
  ],
};

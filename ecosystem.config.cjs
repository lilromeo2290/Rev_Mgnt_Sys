module.exports = {
  apps: [
    {
      name: 'consult-rms',
      script: '.next/standalone/server.js',
      cwd: '/home/consult-rms',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      error_file: '/home/consult-rms/logs/error.log',
      out_file: '/home/consult-rms/logs/out.log',
      time: true,
    },
  ],
};

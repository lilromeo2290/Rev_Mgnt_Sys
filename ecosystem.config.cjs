module.exports = {
  apps: [{
    name: 'consult-rms-new',
    script: 'npm',
    args: 'start',
    cwd: '/home/consult-rms-new',
    env: {
      NODE_ENV: 'production',
      PORT: 4002,
      HOST: '0.0.0.0',
      DATABASE_URL: 'file:/home/consult-rms-new/db/custom.db'
    }
  }]
}

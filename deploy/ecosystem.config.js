/**
 * Configuração do PM2 para Produção (Oracle Cloud / VPS Linux)
 * Permite manter o portal em execução contínua com reinício automático.
 */

module.exports = {
  apps: [
    {
      name: 'psi-portal',
      script: './server.js',
      instances: 'max', // ou 1 para instâncias menores (Always Free)
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};

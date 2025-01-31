const withPWA = require('next-pwa')({
  dest: 'public', // Pasta onde os arquivos do PWA serão gerados
  disable: process.env.NODE_ENV === 'development', // Desativa o PWA em desenvolvimento
  register: true, // Registra o service worker automaticamente
  skipWaiting: true, // Ativa o novo service worker imediatamente
  scope: '/', // Escopo do service worker
  sw: 'service-worker.js', // Nome do arquivo do service worker
  buildExcludes: [/middleware-manifest.json$/], // Exclui arquivos do build
  dynamicStartUrl: true, // URL inicial dinâmica
});

module.exports = withPWA({
  reactStrictMode: true,
});
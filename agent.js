'use strict';

const path = require('path');
const childprocess = require('child_process');
const proxyWorkerFile = path.join(__dirname, './lib/proxy_worker.js');

module.exports = app => {
  const logger = app.logger;
  const config = app.config.proxyworker;
  const env = process.env;
  const proxyPort = config.port || env.EGG_WORKER_PROXY;

  let proxyWorker;

  function forkProxyWorker(debugPort) {
    logger.info(`[egg:proxyworker] ProxyPort is ${proxyPort} and debugPort is ${debugPort}`);
    proxyWorker = childprocess.spawn('node', [ proxyWorkerFile, JSON.stringify({ proxyPort, debugPort }) ], {
      stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ],
      env: {},
    });
  }

  app.messenger.on('conn-proxy-worker', data => {
    if (proxyWorker) {
      logger.info('[egg:proxyworker] Kill proxy worker with signal SIGTERM');
      proxyWorker.kill('SIGTERM');
    }

    setTimeout(() => {
      forkProxyWorker(data.debugPort);
    }, 200);
  });
};

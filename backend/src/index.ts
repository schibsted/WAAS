import autoload from '@fastify/autoload';
import compress from '@fastify/compress';
import sensible from '@fastify/sensible';
import {
  getContentType as getPrometheusContentType,
  getSummary as getPrometheusSummary,
  plugin as promsterPlugin,
} from '@promster/fastify';
import fastify from 'fastify';
import healthcheck from 'fastify-healthcheck';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const port = Number(process.env.API_PORT || 3000);

// Create a Fastify instance
const server = fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  },

  exposeHeadRoutes: true,
  ignoreTrailingSlash: true,
  forceCloseConnections: true,
});

// Register plugins
server.register(sensible);
server.register(compress, {
  threshold: 1,
  brotliOptions: {
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_QUALITY]: 6,
    },
  },
  zlibOptions: {
    level: 6,
  },
});
server.register(healthcheck, {
  healthcheckUrl: '/_health',
  exposeUptime: true,
});
server.register(promsterPlugin, {
  skip: (req, _res, _labels) => {
    // @ts-expect-error
    if (['/_metrics', '/_health'].includes(req.url)) {
      return true;
    }
    return false;
  },
});

// Register metric endpoints
server.get('/_metrics', (req, reply) => {
  getPrometheusSummary()
    .then((summary) => {
      reply.type(getPrometheusContentType()).send(summary);
    })
    .catch((err) => {
      req.log.error(err);
      reply.code(500).send();
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register routes
server.register(autoload, {
  dir: path.join(__dirname, 'routes'),
  options: { prefix: '/api/v2' },
});

// Start the server and listen on the specified port
const start = async () => {
  try {
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (e) => {
  console.error(e);
});

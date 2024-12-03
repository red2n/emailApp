import { FastifyInstance } from 'fastify';
import os from 'os';
import { getDirectories, logRoutes } from './utils.js';
import { registerRoute } from './appServerRoute.js';
import { Route } from '@modules/starter';

const INCOMING_REQUEST_MESSAGE = 'Incoming request:';
const RESPONSE_SENT_MESSAGE = 'Response sent for:';
const SERVICE_IDLE_MESSAGE = 'Service is idle. Total idle time:';
const ROUTE_NOT_FOUND_MESSAGE = 'Route not found:';
const ROUTE_NOT_FOUND_ERROR = 'Route not found';
const GET_DIRECTORIES_PATH = '/getDirectories';
const GET_FILES_PATH = '/getFiles';

export class AppServer {
  static setupFastify(app: FastifyInstance, routes: Route[]) {
    let lastActivityTime = Date.now();
    let totalIdleTime = 0;

    app.addHook('onRequest', (request, _reply, done) => {
      lastActivityTime = Date.now();
      app.log.info(`${INCOMING_REQUEST_MESSAGE} ${request.method} ${request.url}`);
      done();
    });

    app.addHook('onResponse', (request, reply, done) => {
      const statusCode = reply.statusCode;
      if (statusCode >= 200 && statusCode < 300) {
        app.log.info(`${RESPONSE_SENT_MESSAGE} ${request.method} ${request.url} with status ${statusCode}`);
      } else {
        app.log.error(`${RESPONSE_SENT_MESSAGE} ${request.method} ${request.url} with status ${statusCode}`);
      }
      done();
    });

    for (const route of routes) {
      registerRoute(app, route.METHOD, route.ROUTE_URL, async (_request, reply) => {
        const homeDir = os.homedir();
        const directories = getDirectories(homeDir);
        reply.send(directories);
      });
    }

    // registerRoute(app, 'GET', GET_DIRECTORIES_PATH, async (_request, reply) => {
    //   const homeDir = os.homedir();
    //   const directories = getDirectories(homeDir);
    //   reply.send(directories);
    // });

    // registerRoute(app, 'GET', GET_FILES_PATH, async (_request, reply) => {
    //   const homeDir = os.homedir();
    //   const directories = getDirectories(homeDir);
    //   reply.send(directories);
    // });

    const checkIdleTime = () => {
      const currentTime = Date.now();
      const idleTime = currentTime - lastActivityTime;
      if (idleTime > 60000) { // 1 minute
        totalIdleTime += idleTime;
        app.log.info(`${SERVICE_IDLE_MESSAGE} ${totalIdleTime / 1000} seconds`);
        lastActivityTime = currentTime; // Reset last activity time
      }
    };

    setInterval(checkIdleTime, 60000); // Check every minute

    app.setNotFoundHandler((request, reply) => {
      app.log.error(`${ROUTE_NOT_FOUND_MESSAGE} ${request.method} ${request.url}`);
      reply.status(404).send({ error: ROUTE_NOT_FOUND_ERROR });
    });

    return app;
  }

  static async startFastify(app: FastifyInstance, port: number) {
    try {
      await app.listen({ port });
      logRoutes(app);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  }
}
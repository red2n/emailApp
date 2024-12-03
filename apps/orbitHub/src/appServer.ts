import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import os from 'os';
import { getDirectories, logRoutes } from './utils.js';

export class AppServer {
  static setupFastify(app: FastifyInstance) {
    let lastActivityTime = Date.now();
    let totalIdleTime = 0;

    app.addHook('onRequest', (request, _reply, done) => {
      lastActivityTime = Date.now();
      app.log.info(`Incoming request: ${request.method} ${request.url}`);
      done();
    });

    app.addHook('onResponse', (request, reply, done) => {
      const statusCode = reply.statusCode;
      if (statusCode >= 200 && statusCode < 300) {
        app.log.info(`Response sent for: ${request.method} ${request.url} with status ${statusCode}`);
      } else {
        app.log.error(`Response sent for: ${request.method} ${request.url} with status ${statusCode}`);
      }
      done();
    });

    app.get('/getDirectories', async (_request: FastifyRequest, reply: FastifyReply) => {
      const homeDir = os.homedir();
      const directories = getDirectories(homeDir);
      reply.send(directories);
    });

    app.get('/getFiles', async (_request: FastifyRequest, reply: FastifyReply) => {
      const homeDir = os.homedir();
      const directories = getDirectories(homeDir);
      reply.send(directories);
    });

    const checkIdleTime = () => {
      const currentTime = Date.now();
      const idleTime = currentTime - lastActivityTime;
      if (idleTime > 60000) { // 1 minute
        totalIdleTime += idleTime;
        app.log.info(`Service is idle. Total idle time: ${totalIdleTime / 1000} seconds`);
        lastActivityTime = currentTime; // Reset last activity time
      }
    };

    setInterval(checkIdleTime, 60000); // Check every minute

    app.setNotFoundHandler((request, reply) => {
      app.log.error(`Route not found: ${request.method} ${request.url}`);
      reply.status(404).send({ error: 'Route not found' });
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
import type { FastifyInstance } from 'fastify';

const INCOMING_REQUEST_MESSAGE = 'Incoming request:';
const RESPONSE_SENT_MESSAGE = 'Response sent for:';
const SERVICE_IDLE_MESSAGE = 'Service is idle. Total idle time:';
const ROUTE_NOT_FOUND_MESSAGE = 'Route not found:';
const ROUTE_NOT_FOUND_ERROR = 'Route not found';

/**
 * The `AppServer` class provides static methods to set up and start a Fastify server.
 * This class cannot be instantiated.
 *
 * @remarks
 * The `setupFastify` method configures the Fastify instance with various hooks and handlers,
 * including logging for incoming requests and responses, periodic idle time checks, and a 404 not found handler.
 * The `startFastify` method starts the Fastify server on a specified port and handles any errors that occur during startup.
 *
 * @example
 * ```typescript
 * import fastify from 'fastify';
 * import { AppServer } from './appServer';
 *
 * const app = fastify();
 * AppServer.setupFastify(app);
 *
 * AppServer.startFastify(app, 3000).then(() => {
 *   app.log.info('Server started successfully');
 * }).catch(err => {
 *   app.log.error('Failed to start server', err);
 * });
 * ```
 */
export class AppServer {
  constructor() {
    throw new Error('Cannot instantiate this class');
  }
  /**
   * Sets up the Fastify instance with various hooks and handlers.
   *
   * @param {FastifyInstance} app - The Fastify instance to set up.
   * @returns {FastifyInstance} The configured Fastify instance.
   *
   * @remarks
   * This method configures the Fastify instance with the following:
   * - An `onRequest` hook to log incoming requests and update the last activity time.
   * - An `onResponse` hook to log responses with their status codes.
   * - A periodic check for idle time, logging the total idle time if it exceeds 1 minute.
   * - A `setNotFoundHandler` to handle 404 errors and log them.
   *
   * @example
   * ```typescript
   * import fastify from 'fastify';
   * import { setupFastify } from './appServer';
   *
   * const app = fastify();
   * setupFastify(app);
   *
   * app.listen(3000, (err, address) => {
   *   if (err) {
   *     app.log.error(err);
   *     process.exit(1);
   *   }
   *   app.log.info(`Server listening at ${address}`);
   * });
   * ```
   */
  static setupFastify(app: FastifyInstance): FastifyInstance {
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

    app.addHook('onClose', (instance, done) => {
      app.log.info("Unregistering all routes");
      done();
    });

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

  /**
   * Starts the Fastify server on the specified port.
   *
   * @param app - The Fastify instance to start.
   * @param port - The port number on which the server should listen.
   * @throws Will log an error and exit the process if the server fails to start.
   * 
   * @example 
   * ```typescript
   * import fastify from 'fastify';
   * import { AppServer } from './appServer';
   * 
   * const app = fastify();
   * AppServer.setupFastify(app);
   * ```
   */
  static async startFastify(app: FastifyInstance, port: number): Promise<void> {
    try {
      await app.listen({ port });
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  }
}
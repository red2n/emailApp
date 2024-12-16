import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { HttpMethod } from '../routes/utils.js';

/**
 * Utility class for registering routes in the Fastify application.
 */
export class AppServerRoute {

  constructor() {
    throw new Error('This class cannot be instantiated.');
  }
  /**
   * Registers a route with the given HTTP method, path, and handler in the Fastify application.
   *
   * @param app - The Fastify instance to register the route with.
   * @param method - The HTTP method for the route (e.g., 'GET', 'POST', 'PUT', 'DELETE').
   * @param path - The URL path for the route.
   * @param handler - The handler function to process requests to the route.
   * 
   * @example
   * ```typescript
   * AppServerRoute.registerRoute(app, 'GET', '/hello', async (request, reply) => {
   *  reply.send({ message: 'Hello, world!' });
   * });
   * ```
   */
  static registerRoute(
    app: FastifyInstance,
    method: HttpMethod,
    path: string,
    handler: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  ) {
    switch (method) {
      case 'GET':
        app.get(path, handler);
        break;
      case 'POST':
        app.post(path, handler);
        break;
      case 'PUT':
        app.put(path, handler);
        break;
      case 'DELETE':
        app.delete(path, handler);
        break;
      default:
        app.log.error(`Unsupported method: ${method}`);
        break;
    }
  }
}
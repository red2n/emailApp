import { HttpMethod } from '@modules/starter';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export const registerRoute = (
  app: FastifyInstance,
  method: HttpMethod,
  path: string,
  handler: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
) => {
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
};
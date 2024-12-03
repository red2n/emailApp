import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export const registerRoute = (
  app: FastifyInstance,
  method: 'GET' | 'PUT' | 'POST',
  path: string,
  handler: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
) => {
  switch (method) {
    case 'GET':
      app.get(path, handler);
      break;
    case 'PUT':
      app.put(path, handler);
      break;
    case 'POST':
      app.post(path, handler);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};
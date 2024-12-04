import dotenv from 'dotenv';
import { FastifyInstance } from 'fastify';
import { getConnectionString } from './utils.js';
import { AppServer } from './appServer.js';
import { Collection } from 'mongodb';
import { routes } from './routes/register.js';
import { MongoEssentials, KafkaEssentials, logger, InboundSyns, HttpBase, Route } from '@modules/starter';
import { registerRoute } from './appServerRoute.js';

const SERVICE_NAME = 'App';
const DEFAULT_PORT = '8080';
const DB_COLLECTION_NAME = 'rGuestStay';
const SHUTTING_DOWN_MESSAGE = 'Shutting down gracefully...';
const SERVER_CLOSED_MESSAGE = 'Server closed';
const FIRST_DOCUMENT_MESSAGE = 'First document in rGuestStay collection:';

dotenv.config();
const PORT: number = parseInt(process.env.PORT || DEFAULT_PORT);
const app: FastifyInstance = logger(SERVICE_NAME);

AppServer.setupFastify(app);

const registerHttpRoutes = async () => {
  let kafkaRoutes: Route[] = [];
  for (const route of routes) {
    switch (route.TYPE) {
      case 'HTTPINBOUND':
        const httpRoutes = route as HttpBase;
        const routeInstance = route as InboundSyns<any, any, any, any>;
        app.log.info(`Registering ${routeInstance.METHOD} ${httpRoutes.ROUTE_URL}`);
        registerRoute(app, routeInstance.METHOD, httpRoutes.ROUTE_URL, async (_request, reply) => {
          if (typeof routeInstance.extract === 'function' && typeof routeInstance.respond === 'function') {
            const response = await routeInstance.extract(_request);
            if (typeof routeInstance.process === 'function') {
              const processedResponse = await routeInstance.process(response);
              reply.send(processedResponse);
            } else {
              const processedResponse = await routeInstance.respond(response);
              reply.send(processedResponse);
            }
          } else {
            reply.status(500).send({ error: 'Handler method not implemented' });
          }
        });
        break;
      case 'KAFKAINBOUND':
        kafkaRoutes.push(route);
        break;
      default:
        app.log.error(`Route type ${route.TYPE} not supported`);
        break;
    }
  }
  return kafkaRoutes;
};

let rGuestStayCollection: Collection;

const initialize = async () => {
  try {
    const connectionString = getConnectionString();
    const client = await MongoEssentials.connectToMongoDB(connectionString);
    const db = client.db(process.env.DB_NAME);
    rGuestStayCollection = db.collection(DB_COLLECTION_NAME);
    rGuestStayCollection.findOne({}).then((result) => {
      const doc = result?._id;
      if (doc) {
        app.log.info(`${FIRST_DOCUMENT_MESSAGE} ${doc}`);
      }
      else {
        app.log.warn(`${FIRST_DOCUMENT_MESSAGE} not found`);
      }
    });
    await Promise.all([
      registerHttpRoutes(),
      KafkaEssentials.connectToKafka(),
      AppServer.startFastify(app, PORT)
    ])
      .then(() => {
        app.log.info('All services started successfully');
      })
      .catch((err) => {
        app.log.error('Error starting services:', err);
        process.exit(1);
      });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

initialize();

process.on('SIGINT', async () => {
  app.log.info(SHUTTING_DOWN_MESSAGE);
  try {
    await KafkaEssentials.disconnectFromKafka();
    await app.close();
    app.log.info(SERVER_CLOSED_MESSAGE);
    process.exit(0);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
});
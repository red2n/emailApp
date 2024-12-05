import dotenv from 'dotenv';
import type { FastifyInstance } from 'fastify';
import { getConnectionString } from './utils.js';
import { AppServer } from './appServer.js';
import type { Collection } from 'mongodb';
import { routes } from './routes/register.js';
import { MongoEssentials, KafkaEssentials, logger, type InboundSyns, type HttpBase, type Route, KafkaUtils, type KafkaInAsync } from '@modules/starter';
import { registerRoute } from './appServerRoute.js';

const SERVICE_NAME = 'App';
const DEFAULT_PORT = '8080';
const DB_COLLECTION_NAME = 'rGuestStay';
const SHUTTING_DOWN_MESSAGE = 'Shutting down gracefully...';
const SERVER_CLOSED_MESSAGE = 'Server closed';
const FIRST_DOCUMENT_MESSAGE = 'First document in rGuestStay collection:';

dotenv.config();
const PORT: number = Number.parseInt(process.env.PORT || DEFAULT_PORT);
const app: FastifyInstance = logger(SERVICE_NAME);

AppServer.setupFastify(app);

const registerHttpRoutes = async () => {
  const kafkaRoutes: Route[] = [];
  for (const route of routes) {
    switch (route.TYPE) {
      case 'HTTPINBOUND': {
        const httpRoutes = route as HttpBase;
        const httpInstance = route as InboundSyns<any, any, any, any>;
        app.log.info(`Registering ${httpInstance.METHOD} ${httpRoutes.ROUTE_URL}`);
        registerRoute(app, httpInstance.METHOD, httpRoutes.ROUTE_URL, async (_request, reply) => {
          if (typeof httpInstance.extract === 'function' && typeof httpInstance.respond === 'function') {
            const response = await httpInstance.extract(_request);
            if (typeof httpInstance.process === 'function') {
              const processedResponse = await httpInstance.process(response);
              reply.send(processedResponse);
            } else {
              const processedResponse = await httpInstance.respond(response);
              reply.send(processedResponse);
            }
          } else {
            reply.status(500).send({ error: 'Handler method not implemented' });
          }
        });
        break;
      }
      case 'KAFKAINBOUND': {
        const kafkaInstance = route as KafkaInAsync<any, any, any, any>;
        KafkaUtils.initializeConsumer(KafkaEssentials.kafka, KafkaEssentials.kafkaConfig, kafkaInstance.topic)
          .then((consumer) => {
            app.log.info(`Consumer is listening on topic: ${kafkaInstance.topic}`);
            consumer.run({
              eachMessage: async ({ topic, message }) => {
                app.log.info(`Received message: ${message.value?.toString()} on topic: ${topic}`);
                kafkaInstance.consume(message.value?.toString())
              },
            });
          });

        break;
      }
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
      KafkaEssentials.connectToKafka().then(() => {
        registerHttpRoutes().then(() => {
          AppServer.startFastify(app, PORT)
        }).catch((err) => {
          app.log.error('Error registering routes:', err);
          process.exit(1);
        })
      }).catch((err) => {
        app.log.error(`Error Connecting Kafka: ${err}`);
        process.exit(1);
      }),
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
    await await KafkaUtils.disconnectFromKafka(KafkaEssentials.kafka, KafkaEssentials.kafkaConfig, app);
    await app.close();
    app.log.info(SERVER_CLOSED_MESSAGE);
    process.exit(0);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
});
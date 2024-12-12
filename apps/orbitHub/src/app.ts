import {
  AppLogger, AppServer, type HttpBase, type InboundSyns, KafkaEssentials, KafkaUtils, MongoEssentials
} from '@modules/starter';
import dotenv from 'dotenv';
import type { FastifyInstance } from 'fastify';
import type { Consumer, Producer } from 'kafkajs';
import type { Collection } from 'mongodb';
import { routes } from './routes/register.js';
import { getConnectionString } from './utils.js';

const SERVICE_NAME = 'App';
const DEFAULT_PORT = '8080';
const DB_COLLECTION_NAME = 'rGuestStay';
const SHUTTING_DOWN_MESSAGE = 'Shutting down gracefully...';
const SERVER_CLOSED_MESSAGE = 'Server closed';
const FIRST_DOCUMENT_MESSAGE = 'First document in rGuestStay collection:';
const consumers: Consumer[] = [];
const producers: Producer[] = [];
dotenv.config();
const PORT: number = Number.parseInt(process.env.PORT || DEFAULT_PORT);
const app: FastifyInstance = AppLogger.getLogger(SERVICE_NAME);

AppServer.setupFastify(app);

const registerHttpRoutes = async () => {
  for (const route of routes) {
    route.initialize(app);
  }
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
    await KafkaUtils.disconnectFromKafka(KafkaEssentials.kafka, consumers, producers, app);
    await app.close();
    app.log.info(SERVER_CLOSED_MESSAGE);
    process.exit(0);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
});

function registerHttp(httpInstance: InboundSyns<any, any, any, any>, httpRoutes: HttpBase) {

}

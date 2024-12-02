import dotenv from 'dotenv';
import { FastifyInstance } from 'fastify';
import logger from './appLogger.js';
import { MongoEssentials } from './mongoEssentials.js';
import { KafkaEssentials } from './kafkaEssentials.js';
import { getConnectionString } from './utils.js';
import { AppServer } from './appServer.js';
import { Collection } from 'mongodb';
import { routes } from './routes/register.js';

const SERVICE_NAME = 'App';
const DEFAULT_PORT = '8080';
const DB_COLLECTION_NAME = 'rGuestStay';
const SHUTTING_DOWN_MESSAGE = 'Shutting down gracefully...';
const SERVER_CLOSED_MESSAGE = 'Server closed';
const FIRST_DOCUMENT_MESSAGE = 'First document in rGuestStay collection:';

dotenv.config();
const PORT: number = parseInt(process.env.PORT || DEFAULT_PORT);
const app: FastifyInstance = logger(SERVICE_NAME);

AppServer.setupFastify(app, routes);
let rGuestStayCollection: Collection;

const initialize = async () => {
  try {
    const connectionString = getConnectionString();
    const client = await MongoEssentials.connectToMongoDB(connectionString);
    const db = client.db(process.env.DB_NAME);
    rGuestStayCollection = db.collection(DB_COLLECTION_NAME);
    rGuestStayCollection.findOne({}).then((result) => {
      app.log.info(`${FIRST_DOCUMENT_MESSAGE} ${result?._id}`);
    });
    await Promise.all([
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
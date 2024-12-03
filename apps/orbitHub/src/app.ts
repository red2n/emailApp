import dotenv from 'dotenv';
import { FastifyInstance } from 'fastify';
import logger from './appLogger.js';
import { MongoEssentials } from './mongoEssentials.js';
import { KafkaEssentials } from './kafkaEssentials.js';
import { getConnectionString } from './utils.js';
import { AppServer } from './appServer.js';

const SERVICE_NAME = 'App';

dotenv.config();
const PORT: number = parseInt(process.env.PORT || '8080');
const app: FastifyInstance = logger(SERVICE_NAME);

AppServer.setupFastify(app);

let rGuestStayCollection;

const initialize = async () => {
  try {
    const connectionString = getConnectionString();
    const client = await MongoEssentials.connectToMongoDB(connectionString);
    const db = client.db(process.env.DB_NAME);
    rGuestStayCollection = db.collection('rGuestStay');
    rGuestStayCollection.findOne({}).then((result) => {
      app.log.info('First document in rGuestStay collection:', result?._id);
    });
    await KafkaEssentials.connectToKafka();
    await AppServer.startFastify(app, PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

initialize();

process.on('SIGINT', async () => {
  app.log.info('Shutting down gracefully...');
  try {
    await KafkaEssentials.disconnectFromKafka();
    await app.close();
    app.log.info('Server closed');
    process.exit(0);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
});
import {
  AppLogger, AppServer, KafkaEssentials, KafkaUtils, MongoEssentials
} from '@modules/starter';
import dotenv from 'dotenv';
import type { FastifyInstance } from 'fastify';
import type { Consumer, Producer } from 'kafkajs';
import type { Collection } from 'mongodb';
import { routes } from './routes/register.js';
import { getConnectionString } from './utils.js';

class App {
  private static readonly SERVICE_NAME = 'App';
  private static readonly DEFAULT_PORT = '8080';
  private static readonly DB_COLLECTION_NAME = 'rGuestStay';
  private static readonly SHUTTING_DOWN_MESSAGE = 'Shutting down gracefully...';
  private static readonly SERVER_CLOSED_MESSAGE = 'Server closed';
  private static readonly FIRST_DOCUMENT_MESSAGE = 'First document in rGuestStay collection:';
  private consumers: Consumer[] = [];
  private producers: Producer[] = [];
  private app: FastifyInstance;
  private rGuestStayCollection: Collection | undefined;

  constructor() {
    dotenv.config();
    const PORT: number = Number.parseInt(process.env.PORT || App.DEFAULT_PORT);
    this.app = AppLogger.getLogger(App.SERVICE_NAME);
    AppServer.setupFastify(this.app);
    this.initialize(PORT);
    this.setupGracefulShutdown();
  }

  private async registerHttpRoutes() {
    for (const route of routes) {
      route.initialize(this.app);
    }
  }

  private async initialize(PORT: number): Promise<void> {
    try {
      const connectionString = getConnectionString();
      const client = await MongoEssentials.connectToMongoDB(connectionString);
      const db = client.db(process.env.DB_NAME);
      this.rGuestStayCollection = db.collection(App.DB_COLLECTION_NAME);
      this.rGuestStayCollection.findOne({}).then((result) => {
        const doc = result?._id;
        if (doc) {
          this.app.log.info(`${App.FIRST_DOCUMENT_MESSAGE} ${doc}`);
        } else {
          this.app.log.warn(`${App.FIRST_DOCUMENT_MESSAGE} not found`);
        }
      });
      await Promise.all([
        KafkaEssentials.connectToKafka().then(() => {
          this.registerHttpRoutes().then(() => {
            AppServer.startFastify(this.app, PORT);
          }).catch((err) => {
            this.app.log.error('Error registering routes:', err);
            process.exit(1);
          });
        }).catch((err) => {
          this.app.log.error(`Error Connecting Kafka: ${err}`);
          process.exit(1);
        }),
      ])
        .then(() => {
          this.app.log.info('All services started successfully');
        })
        .catch((err) => {
          this.app.log.error('Error starting services:', err);
          process.exit(1);
        });
    } catch (err) {
      this.app.log.error(err);
      process.exit(1);
    }
  }

  private setupGracefulShutdown() {
    process.on('SIGINT', async () => {
      this.app.log.info(App.SHUTTING_DOWN_MESSAGE);
      try {
        for (const route of routes) {
          route.uninitialize(this.app);
        }
        await this.app.close();
        this.app.log.info(App.SERVER_CLOSED_MESSAGE);
        process.exit(0);
      } catch (err) {
        this.app.log.error(err);
        process.exit(1);
      }
    });
  }
}

new App();
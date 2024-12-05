import { MongoClient } from 'mongodb';
import type { FastifyInstance } from 'fastify';
import { logger } from '../logger/appLogger.js';

const CONNECTION_STRING_REQUIRED_ERROR = 'Connection string is required';
const CONNECTION_STRING_TYPE_ERROR = 'Connection string must be a string';
const ATTEMPTING_TO_CONNECT_MESSAGE = 'Attempting to connect to MongoDB server...';
const CONNECTED_TO_MONGODB_MESSAGE = 'Connected to MongoDB server';
const CONNECTION_TIMEOUT_ERROR = 'Failed to connect to MongoDB server: Connection timed out';
const FAILED_TO_CONNECT_MESSAGE = 'Failed to connect to MongoDB server:';

export class MongoEssentials {
    constructor() {
        throw new Error('This class is not meant to be instantiated');
    }
    static async connectToMongoDB(connectionString: string) {
        const app: FastifyInstance = logger(MongoEssentials.name);

        if (!connectionString) {
            app.log.error(CONNECTION_STRING_REQUIRED_ERROR);
            throw new Error(CONNECTION_STRING_REQUIRED_ERROR);
        }

        if (typeof connectionString !== 'string') {
            app.log.error(CONNECTION_STRING_TYPE_ERROR);
            throw new Error(CONNECTION_STRING_TYPE_ERROR);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 30000); // 30 seconds

        app.log.info(ATTEMPTING_TO_CONNECT_MESSAGE);

        try {
            const client = new MongoClient(connectionString, {
                serverSelectionTimeoutMS: 30000 // 30 seconds
            });
            await client.connect();
            clearTimeout(timeout);
            app.log.info(CONNECTED_TO_MONGODB_MESSAGE);
            return client;
        } catch (error) {
            if (controller.signal.aborted) {
                app.log.error(CONNECTION_TIMEOUT_ERROR);
            } else {
                app.log.error(`${FAILED_TO_CONNECT_MESSAGE} ${error}`);
            }
            throw error;
        }
    }
}
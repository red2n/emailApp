import type { FastifyInstance } from 'fastify';
import { MongoClient } from 'mongodb';
import AppLogger from '../logger/appLogger.js';

const CONNECTION_STRING_REQUIRED_ERROR = 'Connection string is required';
const CONNECTION_STRING_TYPE_ERROR = 'Connection string must be a string';
const ATTEMPTING_TO_CONNECT_MESSAGE = 'Attempting to connect to MongoDB server...';
const CONNECTED_TO_MONGODB_MESSAGE = 'Connected to MongoDB server';
const CONNECTION_TIMEOUT_ERROR = 'Failed to connect to MongoDB server: Connection timed out';
const FAILED_TO_CONNECT_MESSAGE = 'Failed to connect to MongoDB server:';

/**
 * A utility class for MongoDB operations.
 * This class is not meant to be instantiated.
 *
 * @class MongoEssentials
 * @throws {Error} Throws an error if an attempt is made to instantiate the class.
 *
 * @method static connectToMongoDB
 * Connects to a MongoDB database using the provided connection string.
 *
 * @param {string} connectionString - The connection string to connect to MongoDB.
 * @returns {Promise<MongoClient>} A promise that resolves to the MongoClient instance if the connection is successful.
 * @throws {Error} Will throw an error if the connection string is not provided or is not a string.
 * @throws {Error} Will throw an error if the connection attempt fails or times out.
 *
 * @example
 * ```typescript
 * const client = await MongoEssentials.connectToMongoDB('mongodb://localhost:27017/mydb');
 * ```
 */
export class MongoEssentials {
    constructor() {
        throw new Error('This class is not meant to be instantiated');
    }
    /**
     * Connects to a MongoDB database using the provided connection string.
     *
     * @param connectionString - The connection string to connect to MongoDB.
     * @returns A promise that resolves to the MongoClient instance if the connection is successful.
     * @throws Will throw an error if the connection string is not provided or is not a string.
     * @throws Will throw an error if the connection attempt fails or times out.
     *
     * @example
     * ```typescript
     * const client = await MongoEssentials.connectToMongoDB('mongodb://localhost:27017/mydb');
     * ```
     */
    static async connectToMongoDB(connectionString: string) {
        const app: FastifyInstance = AppLogger.getLogger(MongoEssentials.name);

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
            await client.connect().then(() => {
                app.log.info(CONNECTED_TO_MONGODB_MESSAGE);
            }).catch((error) => {
                throw error;
            });
            clearTimeout(timeout);
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
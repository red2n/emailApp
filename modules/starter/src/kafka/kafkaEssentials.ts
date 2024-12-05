import dotenv from 'dotenv';
import { Kafka, logLevel } from 'kafkajs';
import AppLogger from '../logger/appLogger.js';
import type { KafkaConfig } from './kafkaConfig.js';

dotenv.config();

const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'openTele';
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'grpOpenTele';
const KAFKA_BROKERS_REQUIRED_ERROR = 'Kafka brokers are required';
const ATTEMPTING_TO_CONNECT_MESSAGE = 'Attempting to connect to Kafka...';
const FAILED_TO_CONNECT_MESSAGE = 'Failed to connect to Kafka:';

/**
 * The `KafkaEssentials` class provides essential methods and properties for interacting with a Kafka messaging system.
 * This class is designed to be used statically and should not be instantiated.
 * 
 * @remarks
 * The class includes a static instance of the Kafka client and configuration settings required to connect to a Kafka cluster.
 * 
 * @example
 * ```typescript
 * await KafkaEssentials.connectToKafka();
 * ```
 * 
 * @throws {Error} If the class is instantiated directly.
 */
export class KafkaEssentials {
    constructor() {
        throw new Error('This class should not be instantiated');
    }
    /**
     * A static instance of the Kafka class.
     * This instance is used to interact with the Kafka messaging system.
     */
    public static kafka: Kafka;
    /**
     * Configuration settings for Kafka.
     * 
     * This static property holds the configuration settings required to connect and interact with a Kafka cluster.
     * 
     * @type {KafkaConfig}
     */
    public static kafkaConfig: KafkaConfig;
    
    /**
     * Connects to a Kafka instance using the provided configuration.
     * 
     * This method initializes a Kafka client with the specified client ID, brokers, and log level.
     * It also sets up custom logging for different log levels (ERROR, WARN, INFO, DEBUG).
     * 
     * @throws {Error} If Kafka is already connected or if the brokers configuration is missing.
     * @throws {Error} If there is an error during the connection attempt.
     * 
     * @example
     * ```typescript
     * await KafkaEssentials.connectToKafka();
     * ```
     */
    static async connectToKafka() {
        if (KafkaEssentials.kafka) {
            throw new Error('Kafka is already connected');
        }
        const app = AppLogger.getLogger(KafkaEssentials.name);
        KafkaEssentials.kafkaConfig = {
            clientId: KAFKA_CLIENT_ID,
            brokers: KAFKA_BROKERS.split(','),
            groupId: KAFKA_GROUP_ID,
        };
        if (!KafkaEssentials.kafkaConfig.brokers.length) {
            app.log.error(KAFKA_BROKERS_REQUIRED_ERROR);
            throw new Error(KAFKA_BROKERS_REQUIRED_ERROR);
        }
        app.log.info(ATTEMPTING_TO_CONNECT_MESSAGE);
        try {
            KafkaEssentials.kafka = new Kafka({
                clientId: KafkaEssentials.kafkaConfig.clientId,
                brokers: KafkaEssentials.kafkaConfig.brokers,
                logLevel: logLevel.INFO,
                logCreator: () => {
                    return ({ namespace, level, log }) => {
                        const { message, ...extra } = log;
                        switch (level) {
                            case logLevel.ERROR:
                                app.log.error({ namespace, ...extra }, message);
                                break;
                            case logLevel.WARN:
                                app.log.warn({ namespace, ...extra }, message);
                                break;
                            case logLevel.INFO:
                                app.log.info({ namespace, ...extra }, message);
                                break;
                            case logLevel.DEBUG:
                                app.log.debug({ namespace, ...extra }, message);
                                break;
                            default:
                                app.log.info({ namespace, ...extra }, message);
                                break;
                        }
                    };
                },
            });
        } catch (error) {
            app.log.error(FAILED_TO_CONNECT_MESSAGE, error);
            throw error;
        }
    }
}
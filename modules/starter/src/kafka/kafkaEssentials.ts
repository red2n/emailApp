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

export class KafkaEssentials {
    constructor() {
        throw new Error('This class should not be instantiated');
    }
    public static kafka: Kafka;
    public static kafkaConfig: KafkaConfig;

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
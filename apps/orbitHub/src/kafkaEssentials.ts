import { Kafka, Consumer, logLevel } from 'kafkajs';
import dotenv from 'dotenv';
import logger from './appLogger.js';

dotenv.config();

const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'openTele';
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'grpOpenTele';
const KAFKA_TOPIC = 'net.navin.connection';
const KAFKA_BROKERS_REQUIRED_ERROR = 'Kafka brokers are required';
const ATTEMPTING_TO_CONNECT_MESSAGE = 'Attempting to connect to Kafka...';
const CONNECTED_TO_KAFKA_MESSAGE = 'Connected to Kafka';
const CONSUMER_LISTENING_MESSAGE = `Consumer is listening on topic: ${KAFKA_TOPIC}`;
const FAILED_TO_CONNECT_MESSAGE = 'Failed to connect to Kafka:';
const DISCONNECTED_FROM_KAFKA_MESSAGE = 'Disconnected from Kafka';
const RECEIVED_MESSAGE_LOG = 'Received message:';

export class KafkaEssentials {
    private static consumer: Consumer;

    static async connectToKafka() {
        const app = logger(KafkaEssentials.name);

        const kafkaConfig = {
            clientId: KAFKA_CLIENT_ID,
            brokers: KAFKA_BROKERS.split(','),
            groupId: KAFKA_GROUP_ID,
        };

        if (!kafkaConfig.brokers.length) {
            app.log.error(KAFKA_BROKERS_REQUIRED_ERROR);
            throw new Error(KAFKA_BROKERS_REQUIRED_ERROR);
        }

        app.log.info(ATTEMPTING_TO_CONNECT_MESSAGE);

        try {
            const kafka = new Kafka({
                clientId: kafkaConfig.clientId,
                brokers: kafkaConfig.brokers,
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

            this.consumer = kafka.consumer({ groupId: kafkaConfig.groupId });
            await this.consumer.connect();
            app.log.info(CONNECTED_TO_KAFKA_MESSAGE);

            await this.consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });

            await this.consumer.run({
                eachMessage: async ({ topic, message }) => {
                    app.log.info(`${RECEIVED_MESSAGE_LOG} ${message.value?.toString()} on topic: ${topic}`);
                },
            });

            app.log.info(CONSUMER_LISTENING_MESSAGE);
        } catch (error) {
            app.log.error(FAILED_TO_CONNECT_MESSAGE, error);
            throw error;
        }
    }

    static async disconnectFromKafka() {
        if (this.consumer) {
            await this.consumer.disconnect();
            logger(KafkaEssentials.name).log.info(DISCONNECTED_FROM_KAFKA_MESSAGE);
        }
    }
}
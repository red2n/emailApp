import type { Kafka, Consumer, Producer } from 'kafkajs';
import type { KafkaConfig } from './kafkaConfig.js';
import type { FastifyInstance } from 'fastify/types/instance.js';

/**
 * Utility class for managing Kafka consumers and producers.
 * This class should not be instantiated.
 */
export class KafkaUtils {

    constructor() {
        throw new Error("This class should not be instantiated");
    }

    /**
     * Initializes a Kafka consumer with the specified configuration and subscribes to the given topic.
     *
     * @param kafka - An instance of the Kafka client.
     * @param kafkaConfig - Configuration settings for the Kafka consumer, including the groupId.
     * @param topic - The topic to which the consumer should subscribe.
     * @returns A promise that resolves to the initialized Kafka consumer.
     */
    static async initializeConsumer(kafka: Kafka, kafkaConfig: KafkaConfig, topic: string): Promise<Consumer> {
        const consumer = kafka.consumer({ groupId: kafkaConfig.groupId });
        await consumer.connect();
        await consumer.subscribe({ topic: topic, fromBeginning: true });
        return consumer;
    }

    /**
     * Initializes and connects a Kafka producer.
     *
     * @param {Kafka} kafka - The Kafka instance to use for creating the producer.
     * @returns {Promise<Producer>} A promise that resolves to the connected Kafka producer.
     */
    static async initializeProducer(kafka: Kafka): Promise<Producer> {
        const producer = kafka.producer();
        await producer.connect();
        return producer;
    }

    /**
     * Disconnects the consumer and producer from Kafka.
     *
     * @param kafka - The Kafka instance to disconnect from.
     * @param kafkaConfig - The configuration object for Kafka, containing the groupId.
     * @param app - The Fastify instance used for logging.
     *
     * @returns A promise that resolves when both the consumer and producer are disconnected.
     *
     * @throws Will log an error if there is an issue disconnecting the consumer or producer.
     */
    static async disconnectFromKafka(kafka: Kafka, kafkaConfig: KafkaConfig, app: FastifyInstance) {
        const consumer = kafka.consumer({ groupId: kafkaConfig.groupId });
        const producer = kafka.producer();

        if (consumer) {
            await consumer.disconnect().then(() => {
                app.log.info("Consumer disconnected from Kafka");
            }).catch((err) => {
                app.log.error("Error disconnecting consumer from Kafka", err);
            });
        }
        if (producer) {
            await producer.disconnect().then(() => {
                app.log.info("Producer disconnected from Kafka");
            }).catch((err) => {
                app.log.error("Error disconnecting producer from Kafka", err);
            });
        }
    }
}
import { Kafka, Consumer, Producer } from 'kafkajs';

const KAFKA_TOPIC = 'net.navin.connection';
const CONNECTED_TO_KAFKA_MESSAGE = 'Connected to Kafka';
const CONSUMER_LISTENING_MESSAGE = `Consumer is listening on topic: ${KAFKA_TOPIC}`;
const RECEIVED_MESSAGE_LOG = 'Received message:';
const PRODUCER_CONNECTED_MESSAGE = 'Producer connected to Kafka';
const DISCONNECTED_FROM_KAFKA_MESSAGE = 'Disconnected from Kafka';

export async function initializeConsumer(kafka: Kafka, kafkaConfig: any, app: any): Promise<Consumer> {
    const consumer = kafka.consumer({ groupId: kafkaConfig.groupId });
    await consumer.connect();
    app.log.info(CONNECTED_TO_KAFKA_MESSAGE);
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            app.log.info(`${RECEIVED_MESSAGE_LOG} ${message.value?.toString()} on topic: ${topic}`);
        },
    });
    app.log.info(CONSUMER_LISTENING_MESSAGE);
    return consumer;
}

export async function initializeProducer(kafka: Kafka, app: any): Promise<Producer> {
    const producer = kafka.producer();
    await producer.connect();
    app.log.info(PRODUCER_CONNECTED_MESSAGE);
    return producer;
}

export async function disconnectFromKafka(consumer: Consumer, producer: Producer, app: any) {
    if (consumer) {
        await consumer.disconnect();
        app.log.info(DISCONNECTED_FROM_KAFKA_MESSAGE);
    }
    if (producer) {
        await producer.disconnect();
        app.log.info(DISCONNECTED_FROM_KAFKA_MESSAGE);
    }
}
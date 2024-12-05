import { Kafka, Consumer, Producer } from 'kafkajs';

export class KafkaUtils {
    static async initializeConsumer(kafka: Kafka, kafkaConfig: any, app: any, topic: string): Promise<Consumer> {
        const consumer = kafka.consumer({ groupId: kafkaConfig.groupId });
        await consumer.connect();
        await consumer.subscribe({ topic: topic, fromBeginning: true });
        return consumer;
    }

    static async initializeProducer(kafka: Kafka, app: any, topic: string, message: string): Promise<Producer> {
        const producer = kafka.producer();
        await producer.connect();
        await producer.send({
            topic: topic,
            messages: [
                { value: message },
            ],
        }).then(() => {
            app.log.info(`Message sent to topic: ${topic}`);
        }).catch((err) => {
            app.log.error(`Error sending message to topic: ${topic}`, err);
        });
        return producer;
    }

    static async disconnectFromKafka(kafka: Kafka, kafkaConfig: any, app: any) {
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
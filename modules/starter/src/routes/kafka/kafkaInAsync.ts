import type { FastifyInstance } from "fastify";
import { KafkaEssentials } from "../../kafka/kafkaEssentials.js";
import { KafkaUtils } from "../../kafka/kafkaUtils.js";
import type { Route } from "../routeBase.js";
import type { ROUTETYPE } from "../utils.js";


/**
 * Represents an asynchronous Kafka route with specific input and output types.
 *
 * @template INTERNALIN - The type of the input data consumed by the route.
 * @template INTERNALRETURN - The type of the data returned by the consume function.
 * @template INTERNALOUT - The type of the data processed by the process function.
 * @template EXTERNALOUT - The type of the data produced by the produce function.
 *
 * @extends Route
 *
 * @property {string} topic - The Kafka topic to consume messages from.
 * @property {string} outTopic - The Kafka topic to produce messages to.
 * @property {(request: INTERNALIN) => INTERNALRETURN} consume - Function to consume and process the input data.
 * @property {(data: INTERNALRETURN) => INTERNALOUT} process - Function to process the consumed data.
 * @property {(data: INTERNALOUT) => EXTERNALOUT} produce - Function to produce the final output data.
 */
export abstract class KafkaInAsync<INTERNALIN, INTERNALRETURN, INTERNALOUT, EXTERNALOUT> implements Route {
    DESCRIPTION?: string | undefined;
    async initialize(app: FastifyInstance): Promise<void> {
        KafkaUtils.initializeConsumer(KafkaEssentials.kafka, KafkaEssentials.kafkaConfig, this.topic)
            .then((consumer) => {
                app.log.info(`Consumer is listening on topic: ${this.topic}`);
                consumer.run({
                    eachMessage: async ({ topic, message }) => {
                        app.log.info(`Received message: ${message.value?.toString()} on topic: ${topic}`);
                        this.consume(message.value as any)
                            .then((data) => {
                                return this.process(data);
                            })
                            .then((data) => {
                                this.produce(data);
                            })
                            .catch((err) => {
                                app.log.error('Error processing message:', err);
                            });
                    },
                });
            });

        KafkaUtils.initializeProducer(KafkaEssentials.kafka).then((producer) => {
            this.produce = async (data: any) => {
                try {
                    await producer.send({
                        topic: this.outTopic,
                        messages: [
                            { value: Buffer.from(data as unknown as ArrayBuffer) },
                        ],
                    });
                    app.log.info(`Message sent to topic: ${this.outTopic}`);
                    return data as unknown as EXTERNALOUT; // Adjust this line as needed to convert INTERNALOUT to EXTERNALOUT
                } catch (err) {
                    app.log.error(`Error sending message to topic: ${this.outTopic}`, err);
                    throw err;
                }
            }
        });
    }
    abstract ID: string;
    abstract TYPE: ROUTETYPE;

    abstract topic: string;
    abstract outTopic: string;
    abstract consume(request: INTERNALIN): Promise<INTERNALRETURN>;
    abstract process(data: INTERNALRETURN): Promise<INTERNALOUT>;
    abstract produce(data: INTERNALOUT): Promise<EXTERNALOUT>;
}
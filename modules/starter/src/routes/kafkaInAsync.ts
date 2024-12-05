import type { Route } from "./routeBase.js";

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
export type KafkaInAsync<INTERNALIN, INTERNALRETURN, INTERNALOUT, EXTERNALOUT> = Route & {
    topic: string;
    outTopic: string;
    consume: (request: INTERNALIN) => INTERNALRETURN;
    process: (data: INTERNALRETURN) => INTERNALOUT;
    produce: (data: INTERNALOUT) => EXTERNALOUT;
}
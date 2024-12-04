import { Route } from "./routeBase.js";

export type KafkaInAsync<INTERNALIN, INTERNALRETURN, INTERNALOUT, EXTERNALOUT> = Route & {
    topic: string;
    outTopic: string;
    consume: (request: INTERNALIN) => INTERNALRETURN;
    process: (data: INTERNALRETURN) => INTERNALOUT;
    produce: (data: INTERNALOUT) => EXTERNALOUT;
}
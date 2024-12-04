import { Route } from "./routeBase.js";

export type KafkaInAsync<INTERNALIN, INTERNALRETURN, EXTERNALOUT> = Route & {
    topic: string;
    outTopic: string;
    consume: (request: INTERNALIN) => INTERNALRETURN;
    process: (data: INTERNALRETURN) => EXTERNALOUT;
    produce: (data: EXTERNALOUT) => Promise<void>;
}
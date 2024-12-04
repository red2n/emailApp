import { KafkaInAsync, ROUTETYPE } from "@modules/starter";

export class NotifyWorker implements KafkaInAsync<string, string, string, string> {
    ID = "NOTIFY_WORKER";
    TYPE = ROUTETYPE.KAFKAINBOUND;
    topic = "net.ion.orchestrator.listen";
    outTopic = "net.ion.orchestrator.notify";
    consume = (request: string): string => {
        return request;
    }
    process = (response: string): string => {
        return response;
    }

    produce = (response: string): string => {
        return response;
    }
}
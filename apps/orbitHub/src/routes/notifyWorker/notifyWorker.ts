import { type KafkaInAsync, ROUTETYPE } from "@modules/starter";

export class NotifyWorker implements KafkaInAsync<string, string, string, string> {
    DESCRIPTION?: string | undefined;
    ID = "NOTIFY_WORKER";
    TYPE = ROUTETYPE.KAFKAINBOUND;
    topic = "net.ion.orchestrator.listen";
    outTopic = "net.ion.orchestrator.notify";

    async consume(request: string): Promise<string> {
        return request;
    }
    async process(data: string): Promise<string> {
        return data;
    }
    async produce(data: string): Promise<string> {
        return `Worker notified: ${data}`;
    }
}
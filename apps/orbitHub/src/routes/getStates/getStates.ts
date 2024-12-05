
import { type InboundSyns, HttpMethod, ROUTETYPE } from '@modules/starter';

export class GetStates implements InboundSyns<Request, string[], string[], string> {
    ID = 'GET_STATES';
    ROUTE_URL = '/states';
    METHOD = HttpMethod.GET;
    TYPE = ROUTETYPE.HTTPINBOUND;
    async extract (request: Request): Promise<string[]> {
        return ["Tamil Nadu", "Kerala", "Andra Pradesh"];
    };
   async respond (response: string[]): Promise<string> {
        return JSON.stringify(response);
    }
}
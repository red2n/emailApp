
import { InboundSyns, HttpMethod, ROUTETYPE } from '@modules/starter';

export class GetStates implements InboundSyns<Request, string[], string[], string> {
    ID = 'GET_STATES';
    ROUTE_URL = '/states';
    METHOD = HttpMethod.GET;
    TYPE = ROUTETYPE.HTTPINBOUND;
    extract = (request: Request): string[] => {
        return ["Tamil Nadu", "Kerala", "Andra Pradesh"];
    };
    respond = (response: string[]): string => {
        return JSON.stringify(response);
    }
}
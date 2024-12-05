
import { type InboundSyns, HttpMethod, ROUTETYPE } from '@modules/starter';

export class GetCountries implements InboundSyns<Request, string[], string[], string> {
    ID = 'GET_COUNTRIES';
    ROUTE_URL = '/countries';
    METHOD = HttpMethod.GET;
    TYPE = ROUTETYPE.HTTPINBOUND;
    extract = (request: Request): string[] => {
        return ["india", "usa", "uk"];
    };
    respond = (response: string[]): string => {
        return JSON.stringify(response);
    };
}
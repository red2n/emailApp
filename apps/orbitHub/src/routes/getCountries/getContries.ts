
import {   HttpMethod, InboundSyns, ROUTETYPE } from '@modules/starter';

export class GetCountries extends InboundSyns<Request, string[], string[], string> {
    ID = 'GET_COUNTRIES';
    ROUTE_URL = '/countries';
    METHOD = HttpMethod.GET;
    TYPE = ROUTETYPE.HTTPINBOUND;
    async extract(request: Request): Promise<string[]> {
        return ["india", "usa", "uk"];
    };
    async respond(response: string[]): Promise<string> {
        return JSON.stringify(response);
    };
}
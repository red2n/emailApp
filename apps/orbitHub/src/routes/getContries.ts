
import { InboundSyns, HttpMethod, ROUTETYPE } from '@modules/starter';

export class GetCountries implements InboundSyns<Request, string[], string[], Response> {
    ID = 'GET_COUNTRIES';
    ROUTE_URL = '/countries';
    METHOD = HttpMethod.GET;
    TYPE = ROUTETYPE.INBOUND;
    extract = (request: Request): string[] => {
        return [];
    };
    respond = (response: string[]) => {
        const responseObj = new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        return responseObj;
    };
}
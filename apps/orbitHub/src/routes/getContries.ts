
import { InboundSyns, Route, ROUTETYPE } from '@modules/starter';

export class GetCountries implements InboundSyns<Request, string[], string[], Response> {
    ROUTE_URL = '/countries';
    METHOD = 'GET';
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
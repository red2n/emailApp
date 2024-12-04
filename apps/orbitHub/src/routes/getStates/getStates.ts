
import { InboundSyns, HttpMethod, ROUTETYPE } from '@modules/starter';

export class GetStates implements InboundSyns<Request, string[], string[], Response> {
    ID = 'GET_STATES';
    ROUTE_URL = '/states';
    METHOD = HttpMethod.GET;
    TYPE = ROUTETYPE.INBOUND;
    extract = (request: Request): string[] => {
        return ["Tamil Nadu", "Kerala", "Andra Pradesh"];
    };
    respond = (response: string[]): Response => {
        const responseObj = new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        return responseObj;
    };
}
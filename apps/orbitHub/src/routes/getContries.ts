
import { InboundSyns } from '@modules/starter';

export class GetCountries implements InboundSyns<Request, string[], string[], Response> {
    ROUTE_URL = '/getCountries';
    METHOD = 'GET';
    extraceData = async (request: Request) => {
        return [];
    };
    process = async (data: string[]) => {
        return data;
    };
    respond = async (response: string[]) => {
        return response;
    };
}
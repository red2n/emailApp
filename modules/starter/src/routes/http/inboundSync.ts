import type { FastifyInstance } from "fastify";
import { AppServerRoute } from "../../helpers/appServerRoute.js";
import type { HttpBase } from "../httpBase.js";
import type { HttpMethod, ROUTETYPE } from "../utils.js";
/**
 * Represents an inbound synchronization route with specific types for input, return, response, and output.
 *
 * @template INTERNALIN - The type of the input request.
 * @template INTERNALRETURN - The type of the data returned from the extract function.
 * @template INTERNALRES - The type of the data returned from the process function.
 * @template INTERNALOUT - The type of the output response.
 *
 * @extends Route
 *
 * @property {function(INTERNALIN): INTERNALRETURN} extract - A function that extracts data from the input request.
 * @property {function(INTERNALRETURN): INTERNALRES} [process] - An optional function that processes the extracted data.
 * @property {function(INTERNALRES): INTERNALOUT} respond - A function that generates the output response from the processed data. 
 * 
 * @example
 * ```typescript
 * 
 * import { InboundSyncRoute } from '@modules/starter';
 * import { FastifyInstance } from 'fastify';
 * 
 * class InboundSyncRoute extends InboundSyns<K,X,Y,Z> {
 * ID = 'InboundSyncRoute';
 * TYPE = ROUTETYPE.HTTP;
 * METHOD = 'POST';
 * ROUTE_URL = '/inbound-sync';
 * ``` 
 */
export abstract class InboundSyns<
    INTERNALIN,
    INTERNALRETURN,
    INTERNALRES,
    INTERNALOUT,
> implements HttpBase {
    uninitialize(app: FastifyInstance): Promise<void> {
        return Promise.resolve();
    }
    DESCRIPTION?: string | undefined;
    async initialize(app: FastifyInstance): Promise<void> {
        app.log.info(`Registering ${this.METHOD} ${this.ROUTE_URL}`);
        AppServerRoute.registerRoute(
            app,
            this.METHOD,
            this.ROUTE_URL,
            async (_request, reply) => {
                const response = await this.extract(_request as INTERNALIN);
                if (typeof this.process === "function") {
                    const processedResponse = await this.process(response);
                    reply.send(processedResponse);
                } else {
                    const processedResponse = await this.respond(
                        response as unknown as INTERNALRES,
                    );
                    reply.send(processedResponse);
                }
            },
        );
    }
    abstract ID: string;
    abstract TYPE: ROUTETYPE;
    abstract METHOD: HttpMethod;
    abstract ROUTE_URL: string;
    abstract extract(request: INTERNALIN): Promise<INTERNALRETURN>;
    process?(data: INTERNALRETURN): Promise<INTERNALRES>;
    abstract respond(response: INTERNALRES): Promise<INTERNALOUT>;
}

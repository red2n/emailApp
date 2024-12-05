import type { HttpBase } from "./httpBase.js";
import { Route } from "./routeBase.js";
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
 */
export type InboundSyns<INTERNALIN, INTERNALRETURN, INTERNALRES, INTERNALOUT> = HttpBase & {
    extract(request: INTERNALIN): Promise<INTERNALRETURN>;
    process?(data: INTERNALRETURN): Promise<INTERNALRES>;
    respond(response: INTERNALRES): Promise<INTERNALOUT>;
}
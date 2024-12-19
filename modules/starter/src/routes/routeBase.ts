import type { FastifyInstance } from "fastify";
import type { ROUTETYPE } from "./utils.js";

/**
 * The base interface for all routes.
 * 
 * @interface Route
 * @property {string} ID The unique identifier for the route.
 * @property {ROUTETYPE} TYPE The type of the route, defined by the ROUTETYPE enum.
 * @property {string} [DESCRIPTION] A description of the route.
 * @property {Function} initialize Initializes the route.
 * @exports Route
 * 
 * @example
 * ```typescript
 * import type { FastifyInstance } from "fastify";
 * import type { ROUTETYPE } from "./utils.js";
 * 
 * ```
 */
export type Route = {
    /**
     * The unique identifier for the route.
     */
    ID: string;

    /**
     * The type of the route, defined by the ROUTETYPE enum.
     */
    TYPE: ROUTETYPE;

    /**
     * A description of the route.
     */
    DESCRIPTION?: string;

    initialize(app: FastifyInstance): Promise<void>;
    uninitialize(app: FastifyInstance): Promise<void>;
}
import type { Route } from "./routeBase.js";
import type { HttpMethod } from "./utils.js";

/**
 * Represents a base HTTP route.
 * 
 * @extends Route
 * 
 * @property {HttpMethod} METHOD - The HTTP method used by the route (e.g., GET, POST).
 * @property {string} ROUTE_URL - The URL path of the route.
 */
export type HttpBase = Route & {
    /**
     * The HTTP method used by the route (e.g., GET, POST).
     */
    METHOD: HttpMethod;
    /**
     * The URL path of the route.
     */
    ROUTE_URL: string;

}
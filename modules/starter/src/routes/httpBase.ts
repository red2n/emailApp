import { Route } from "./routeBase.js";
import { HttpMethod } from "./utils.js";

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
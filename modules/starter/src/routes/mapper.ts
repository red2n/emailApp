import { HttpMethod, ROUTETYPE } from "./utils.js";

/**
 * Represents a route in the application.
 */
export type Route = {
    /**
     * The unique identifier for the route.
     */
    ID: string;

    /**
     * The URL path of the route.
     */
    ROUTE_URL: string;

    /**
     * The HTTP method used by the route (e.g., GET, POST).
     */
    METHOD: HttpMethod;

    /**
     * The type of the route, defined by the ROUTETYPE enum.
     */
    TYPE: ROUTETYPE;

    /**
     * A description of the route.
     */
    DESCRIPTION?: string;
}
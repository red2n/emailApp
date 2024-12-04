
import { Route } from "@modules/starter";
import { GetCountries } from "./getCountries/getContries.js";
import { GetStates } from "./getStates/getStates.js";

const routes: Route[] = [
    new GetCountries(),
    new GetStates()
];

export { routes };
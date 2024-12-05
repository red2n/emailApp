
import type { Route } from "@modules/starter";
import { GetCountries } from "./getCountries/getContries.js";
import { GetStates } from "./getStates/getStates.js";
import { NotifyWorker } from "./notifyWorker/notifyWorker.js";

const routes: Route[] = [
    new GetCountries(),
    new GetStates(),
    new NotifyWorker()
];

export { routes };
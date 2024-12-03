import { Route } from "./mapper.js";
export type InboundSyns<INTERNALIN,INTERNALRETURN,INTERNALRES,INTERNALOUT>  = Route &{
    extract: (request:INTERNALIN)=>INTERNALRETURN;
    process?: (data:INTERNALRETURN)=>INTERNALRES;
    respond: (response:INTERNALRES)=>INTERNALOUT;
}
export type InboundSyns<INTERNALIN,INTERNALRETURN,INTERNALRES,INTERNALOUT> ={
    ROUTE_URL: string;
    METHOD: string;
    extraceData: (request:INTERNALIN)=>INTERNALRETURN;
    process?: (data:INTERNALRETURN)=>INTERNALRES;
    respond: (response:INTERNALRES)=>INTERNALOUT;
}
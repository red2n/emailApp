/**
 * Enum representing the type of route in the email application.
 * 
 * @enum {string}
 * @readonly
 */
export const enum ROUTETYPE{
    INBOUND = 'INBOUND',
    OUTBOUND = 'OUTBOUND'
}

export enum HttpMethod {
    GET = 'GET',
    HEAD = 'HEAD',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    CONNECT = 'CONNECT',
    OPTIONS = 'OPTIONS',
    TRACE = 'TRACE',
    PATCH = 'PATCH'
  }
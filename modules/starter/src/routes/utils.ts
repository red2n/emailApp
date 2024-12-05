/**
 * Enum representing the type of route in the email application.
 * 
 * @enum {string}
 * @readonly
 */
export enum ROUTETYPE{
    HTTPINBOUND = 'HTTPINBOUND',
    HTTPOUTBOUND = 'HTTPOUTBOUND',
    KAFKAINBOUND = 'KAFKAINBOUND',
    KAFKAOUTBOUND = 'KAFKAOUTBOUND'
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
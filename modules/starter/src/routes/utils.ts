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

/**
 * Enum representing HTTP methods.
 * 
 * @enum {string}
 * @property {string} GET - The GET method requests a representation of the specified resource.
 * @property {string} HEAD - The HEAD method asks for a response identical to a GET request, but without the response body.
 * @property {string} POST - The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.
 * @property {string} PUT - The PUT method replaces all current representations of the target resource with the request payload.
 * @property {string} DELETE - The DELETE method deletes the specified resource.
 * @property {string} CONNECT - The CONNECT method establishes a tunnel to the server identified by the target resource.
 * @property {string} OPTIONS - The OPTIONS method is used to describe the communication options for the target resource.
 * @property {string} TRACE - The TRACE method performs a message loop-back test along the path to the target resource.
 * @property {string} PATCH - The PATCH method applies partial modifications to a resource.
 */
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
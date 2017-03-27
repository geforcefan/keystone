/**
 * successResponse.js
 *
 * With this helper we guaruentee a response format which is predictable for the client.
 * This is an effective way to avoid mixed responses. It´s called conventions ladies and gentlemen.
 *
 *
 * @class successResponse
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-10
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

/**
 * Returns an success object which can be passed to the response.
 *
 *      res.send(successResponse({
 *          user: {
 *              firstname: "Hello",
 *              lastname: "World"
 *          }
 *      }))
 *
 * @method export successResponse
 * @param data {*} any data
 * @return {Object} {{success: boolean, data: *}}
 */
export function successResponse(data) {
    return {
        success: true,
        data: data
    }
}
/**
 * errorResponse.js
 *
 * A little helper which SHOULD be used when errors occurs which should responded to the requestee.
 * With this helper we guaruentee on errors a response format which is predictable for the client.
 * This is an effective way to avoid mixed responses. It´s called conventions ladies and gentlemen.
 *
 *
 * @class errorResponse
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-10
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import { Enum } from 'enumify';
import { tr } from '../../shared/helper/i18n'

export class ErrorCodes extends Enum {}

ErrorCodes.initEnum(require('./../definitions/errorCodes').default);

/**
 * Returns an error object which can be passed to the response
 *
 * @example
 *      res.send(errorResponse(ErrorCodes.authenticationUserNotFound))
 *
 * @method export errorResponse
 * @param errorCode {ErrorCodes} error code
 * @param arguments {*} which is passed to the translator (see i18n::tr)
 * @return {Object} formatted response {{success: boolean, errorCode: string, message: string}}
 */
export function errorResponse(errorCode) {
    if(errorCode instanceof ErrorCodes) {
        let nArguments = Object.assign(arguments, { "0": `errorCodes.${errorCode.name}`});

        let result = {
            success: false,
            errorCode: `ErrorCodes.${errorCode.name}`,
            message: tr.apply(this, nArguments)
        };

        console.log(`Error occurred: ${result.message}`);

        return result;
    } else throw "argument errorCode must be an instance of ErrorCodes";
}

/**
 * Just a wrapper for internal errors, this basically calls errorResponse()
 *
 * @method export internalErrorResponse
 * @return {Object} formatted response {{success: boolean, errorCode: string, message: string}}
 */
export function internalErrorResponse() {
    return errorResponse(ErrorCodes.internalError);
}
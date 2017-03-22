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
import _ from 'lodash'

export class ErrorCodes extends Enum {}
ErrorCodes.initEnum(require('./../definitions/errorCodes').default);

/**
 * Returns an error object which can be passed to the response
 *
 * @example
 *      res.send(errorResponse(ErrorCodes.authenticationUserNotFound))
 *
 * @method export errorResponse
 * @param error {*} error
 * @param arguments {*} which is passed to the translator (see i18n::tr)
 * @return {Object} formatted response {{success: boolean, errorCode: string, message: string}}
 */
export function errorResponse(error) {
    if(error instanceof ErrorCodes) {
        let nArguments = Object.assign(arguments, { "0": `errorCodes.${error.name}`});

        let result = {
            success: false,
            errorCode: `ErrorCodes.${error.name}`,
            message: tr.apply(this, nArguments)
        };

        console.log(`Error occurred: ${result.message}`);

        return result;
    } else {
        if(error && error.name === "ValidationError") {
            return {
                success: false,
                errorCode: null,
                message: _(error.errors).map((err, field) => {
                    console.log(`Error occurred for field '${field}': ${err.message}`);

                    if(err.properties)
                        switch(err.properties.type) {
                            case "required":
                                return tr('errorCodes.mongooseValidationErrorRequired', field);
                            case "enum":
                                return tr('errorCodes.mongooseValidationErrorEnum', field, err.properties.enumValues.join(", "));
                        }
                    else
                        return null;

                }).filter(v => v).value()
            }
        }

        if(error && error.name === "MongoError") {
            console.log(`Error occurred: ${error.message}`);

            let nArguments = _(arguments).omit(["0"]).map(v => v).value();
            return errorResponse.apply(this, nArguments);
        }

        console.log(`Error occurred: `, arguments);

        return {
            success: false,
            errorCode: null,
            message: arguments
        }
    }
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
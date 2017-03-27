/**
 * failedMail.js
 *
 * Failed mail model
 *
 *
 * @namespace server.models
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-22
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Mongoose from '../helper/misc/mongoose';

/**
 * Failed mails model
 *
 * @class FailedMailSchema
 * @extends Mongoose.Schema
 */
export class FailedMailSchema extends Mongoose.Schema {
    constructor() {
        super({
            /**
             * Mail sender
             *
             * @attribute from
             * @required
             * @type String
             */
            from: {
                type: String,
                required: true
            },

            /**
             * Mail text
             *
             * @attribute text
             * @required
             * @type String
             */
            text: {
                type: String,
                required: true
            },

            /**
             * Mail attachment
             *
             * @attribute attachment
             * @type Array
             * @default []
             * @optional
             */
            attachment: {
                type: [],
                default: []
            },

            /**
             * Mail recipient
             *
             * @attribute to
             * @required
             * @type String
             */
            to: {
                type: String,
                required: true
            },
            
            /**
             * Mail subject
             *
             * @attribute subject
             * @required
             * @type String
             */
            subject: {
                type: String,
                required: true
            },

            /**
             * Amount of retries
             *
             * @attribute retried
             * @default 0
             * @type Number
             * @optional
             */
            retried: {
                type: Number,
                default: 0
            }
        });
    };
}

export default Mongoose.model('FailedMail', new FailedMailSchema());
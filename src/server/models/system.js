/**
 * system.js
 *
 * System information model
 *
 *
 * @namespace server.models
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-12
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Mongoose from '../helper/mongoose';

/**
 * System storage model
 *
 * @class SystemSchema
 * @extends Mongoose.Schema
 */
export class SystemSchema extends Mongoose.Schema {
    constructor() {
        super({
            /**
             * Last update job date. {{#crossLink "server.helper.setup"}}Used when updates are checked{{/crossLink}}
             *
             * @attribute lastUpdateDate
             * @type Date
             * @optional
             * @default null
             */
            lastUpdateDate: {
                type: Date,
                default: null
            },
        });
    };
}

export default Mongoose.model('System', new SystemSchema());
/**
 * socialLinks.js
 *
 * Social links model
 *
 *
 * @namespace server.models
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-17
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Mongoose from '../helper/mongoose';

/**
 * Social links model
 *
 * GitHub issue: https://github.com/geforcefan/keystone/issues/2
 *
 * @class SocialLinksSchema
 * @extends Mongoose.Schema
 */
export default class SocialLinksSchema extends Mongoose.Schema {
    constructor() {
        super({
            /**
             * Social link type
             *
             *      ['Steam', 'YouTube', "Twitch"]
             *
             * @attribute socialType
             * @type String
             * @required
             */
            socialType: {
                type: String,
                enum: ['Steam', 'YouTube', "Twitch"],
                required: true
            },

            /**
             * Social link
             *
             * @attribute link
             * @type String
             * @required
             */
            link: {
                type: String,
                required: true
            }
        });
    }
}
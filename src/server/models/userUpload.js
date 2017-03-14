/**
 * userUpload.js
 *
 * user upload model
 *
 *
 * @namespace server.models
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-13
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Mongoose from '../helper/mongoose';

/**
 * User upload model
 *
 * GitHub issue: https://github.com/geforcefan/keystone/issues/5
 *
 * @class UserUploadSchema
 */
class UserUploadSchema extends Mongoose.Schema {
    constructor() {
        super({
            /**
             * Name of the upload (park name, coaster name, etc.)
             *
             * @attribute name
             * @type String
             * @required
             */
            name: {
                type: String,
                required: true
            },

            /**
             * {{#crossLink "server.models.UserSchema"}}User id{{/crossLink}} of the author
             *
             * @attribute userID
             * @type String
             * @required
             */
            userID: {
                type: String,
                required: true
            },

            /**
             * {{#crossLink "server.models.MediaSchema"}}Media id{{/crossLink}} of the upload
             *
             * @attribute mediaID
             * @type String
             * @required
             */
            mediaID: {
                type: String,
                required: true
            },

            /**
             * Tags of the upload.
             *
             * Available tags:
             *
             *      ['realistic', 'recreation', 'fantasy']
             *
             * @attribute tags
             * @type Array
             * @optional
             * @default []
             *
             */
            tags: {
                type: Array,
                enum: ['realistic', 'recreation', 'fantasy'],
                default: []
            },

            /**
             * Type of the upload.
             *
             * Available types:
             *
             *      ['NoLimits', 'RollerCoasterTycoon', 'PlanetCoaster']
             *
             * @attribute type
             * @type String
             * @required
             */
            type: {
                required: true,
                type: String,
                enum: ['NoLimits', 'RollerCoasterTycoon', 'PlanetCoaster']
            }
        }, {
            discriminatorKey: 'type'
        });
    };
}

export default Mongoose.model('UserUpload', new UserUploadSchema());
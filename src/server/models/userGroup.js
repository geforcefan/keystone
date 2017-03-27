/**
 * userGroup.js
 *
 * User group model
 *
 *
 * @namespace server.models
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-10
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Mongoose from '../helper/misc/mongoose';

/**
 * User group model
 *
 * @class UserGroupSchema
 * @extends Mongoose.Schema
 */
export class UserGroupSchema extends Mongoose.Schema {
    constructor() {
        super({
            /**
             * Group identifier.
             *
             * @attribute name
             * @type String
             * @required
             */
            name: {
                type: String,
                unique: true,
                required: true
            },

            permissions: {
                /**
                 * When this options is turned on, this group will include all available
                 * {{#crossLink "server.definitions.permissions"}}permissions from the definitions{{/crossLink}}.
                 * No need to fill the
                 * {{#crossLink "server.models.UserGroupSchema/permissions.allowedTo:attribute"}}allowedTo{{/crossLink}}
                 * attribute.
                 *
                 * @attribute permissions.hasAllPermissions
                 * @optional
                 * @type Boolean
                 * @default false
                 */
                hasAllPermissions: {
                    type: Boolean,
                    default: false
                },

                /**
                 * All permissions of the group. Can be defined in the
                 * {{#crossLink "server.definitions.permissions"}}permission{{/crossLink}} definitions.
                 *
                 * @attribute permissions.allowedTo
                 * @optional
                 * @type [String]
                 * @default []
                 */
                allowedTo: [String]
            },

            /**
             * Group level. Less level, more "root"ness.
             * A {{#crossLink "server.models.UserSchema"}}user{{/crossLink}} will inherit
             * all group permissions above it´s level value
             *
             * @attribute permissions.level
             * @required
             * @type Number
             * @default 3000
             */
            level: {
                type: Number,
                default: 3000,
                required: true
            }
        });
    };
}

export default Mongoose.model('UserGroup', new UserGroupSchema());
/**
 * permissions.js
 *
 * Definition of API permissions. You can check for a user permission by using
 * {{#crossLink "server.models.UserSchema/isAllowed:method"}}isAllowed{{/crossLink}} method of the user model
 * which is provided in each request.
 *
 * Important: the group of a user needs assigned permissions.
 * You can assign the permissions to a group directly in the database
 * or in the administration interface of the website
 *
 *      req.user.isAllowed("user.set")
 *      req.user.isAllowed("coaster.park.set")
 *
 *
 * @class permissions
 * @namespace server.definitions
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-11
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

/**
 * permission definitions
 *
 * @attribute export default
 * @type Object
 */
export default {
    user: {
        set: {
            own: ['name', 'password', 'email', 'profile'],
            other: ['name', 'password', 'email', 'groupID', 'profile']
        },
        delete: {
            own: ['account'],
            other: ['account']
        },
        create: ['account']
    }
};
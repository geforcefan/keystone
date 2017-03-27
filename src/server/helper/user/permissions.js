/**
 * permissions.js
 *
 * Permission helper. This will flatten the defined permissions (definitions/permissions.js).
 *
 *      {
 *          user: ['add', 'delete', 'update'],
 *          foo: {
 *              bar: ['test1', 'test2']
 *          }
 *      }
 *
 * will turn to:
 *
 *      ['user.add', 'user.delete', 'user.update', 'foo.bar.test1', 'foo.bar.test2']
 *
 * Those flat permissions are now accessible via:
 *
 *      req.user.allowedTo('foo.bar.test1')
 *
 * We convert the nested permissions to a flat one, because its way easier to handle in the code
 * and in the database, but nested format is better readable for pure definition
 *
 * @class permissions
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-12
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import permissionDefinitions from '../../definitions/permissions'
import _ from 'lodash'

/**
 * Flattens nested permissions
 *
 * @method flattenPermissions
 * @private
 * @param nestedPermissions {Object} nested permissions
 * @param prefix {String} prefix
 * @return {Array} flat list
 */
function flattenPermissions(nestedPermissions, prefix = "") {
    return Object.keys(nestedPermissions).reduce((acc, key) => {
        let val = nestedPermissions[key];
        let prefixedKey = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(val))
            acc = acc.concat(val.map(key => `${prefixedKey}.${key}`));

        if(_.isPlainObject(val))
            acc = acc.concat(flattenPermissions(val, prefixedKey));

        return acc;
    }, []);
}

/**
 * Get a flat permission list
 *
 * @method export default
 * @return {Object} flat permission list
 */
export default flattenPermissions(permissionDefinitions);
/**
 * service.js
 *
 * Service helper. Inherit this class in any service.
 *
 * GitHub issue: https://github.com/geforcefan/keystone/issues/7
 *
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-15
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Services from './services'

/**
 * Service helper class. Inherit this class in any service.
 *
 * @class Service
 * @extends server.helper.Services
 */
export default class Service extends Services {
    /**
     * Get the requestee user
     *
     * @method getUser
     * @returns {UserSchema}
     */
    getUser() {
        return process.domain.req.user;
    }

    /**
     * Is the requestee user authenticated
     *
     * @method isUserAuth
     * @returns {Boolean}
     */
    isUserAuth() {
        return Service.getUser().isAuth();
    }
}
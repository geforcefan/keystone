/**
 * errorCodes.js
 *
 * All error codes are defined here. Add new error codes when needed.
 * The messages should be provided in the locales strings (locales/strings.js)
 *
 *      {
 *          ...
 *          "errorCodes": {
 *              ...
 *              "authenticationUserNotFound": "User not found"
 *              ...
 *          }
 *          ...
 *      }
 *
 *
 * @class errorCodes
 * @namespace server.definitions
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-09
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

/**
 * error codes
 *
 * @attribute export default
 * @type Array
 */
export default [
    'authenticationUserNotFound',
    'authenticationWrongPassword',
    'authenticationUserInactive',
    'mongooseValidationErrorRequired',
    'mongooseValidationErrorEnum',
    'registrationFillAllFields',
    'registrationUsernameOrEmailExists',
    'userActivateFailed',
    'userActivateTokenExpired',
    'userActivateUserAlreadyActive',
    'userGroupNotFound',
    'userModifyCantModifyUserWithLessEqualLevelThanMe',
    'userModifyCantAssignGroupWithLessEqualLevelThanMe',
    'userCantBlockItSelf',
    'userCantUnblockItSelf',
    'userCantSubscribeItSelf',
    'userCantUnsubscribeItSelf',
    'userNotFound',
    'internalError',
    'invalidObjectID',
    'operationNotAllowed'
];
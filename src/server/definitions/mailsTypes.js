/**
 * mailTypes.js
 *
 * Definition of available mail types. Subjects will be translated automatically by
 * grabbing the translation from the locales file:
 *
 *      "email.{mailType}.subject
 *
 * As well as the templates will be grabbed from
 *
 *      locales/mails/{locale}/{mailType}.ejs
 *
 * @class mailTypes
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
 * mail type definitions
 *
 * @attribute export default
 * @type Object
 */
export default [
    'userActivation'
];
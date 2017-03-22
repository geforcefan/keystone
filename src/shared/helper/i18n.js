/**
 * i18n.js
 *
 * Helper class for i18n detection and translation.
 *
 *
 * @namespace shared.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-09
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import languages from '../definitions/languages'
import LanguageParser from 'accept-language-parser';

/**
 * i18n helper for translations and locale detection
 *
 * @class i18n
 */
class i18n {
    /**
     * Flattens messages.
     *
     * We want to use nested objects when we provide strings in locales/
     * because of the maintainability. So we need this method to flatten such a structure:
     *
     *      {
     *          "client": {
     *              "string1": "Hello",
     *              "string2": "World"
     *          }
     *      }
     *
     * to:
     *
     *      {
     *          "client.string1": "Hello",
     *          "client.string2": "World"
     *      }
     *
     * When there is an impact of performance because of this, we should pre process the strings.js
     * in the building stage
     *
     * @method flattenMessages
     * @static
     * @param nestedMessages {Object} nested messages
     * @param prefix {String} prefix
     * @return {Object} flatten messages object
     */
    static flattenMessages(nestedMessages, prefix = '') {
        return Object.keys(nestedMessages).reduce((messages, key) => {
            let value       = nestedMessages[key];
            let prefixedKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'string') {
                messages[prefixedKey] = value;
            } else {
                Object.assign(messages, i18n.flattenMessages(value, prefixedKey));
            }

            return messages;
        }, {});

    }

    /**
     * Import all locale strings and cache them after flatting the strings
     *
     * @method readAndCacheLocaleStrings
     * @static
     *
     */
    static readAndCacheLocaleStrings() {
        languages.forEach(language => {
            i18n.cachedLocaleStrings[language] = i18n.flattenMessages(require(`../../../locales/${language}/strings`).default);
        });
    }

    /**
     * Detect locale from server request
     *
     * @method detectLocaleFromRequest
     * @static
     * @param req {Object} Express request
     * @return {String} locale
     */
    static detectLocaleFromRequest(req) {
        let pickedLocale = LanguageParser.pick(languages, req.headers['accept-language']);

        if(typeof pickedLocale === "undefined" || pickedLocale === null)
            pickedLocale = i18n.defaultLocale;

        return pickedLocale;
    }

    /**
     * Basically just picking the lang attribute from the HTML element and make
     * this global accessible via languageDetector.currentLocale.
     * The business logic of which language should picked SHOULD exclusively
     * detected server side (check server.js). The server then renders the HTML Layout
     * with the right lang attribute, so the client just have to pick the locale which is
     * passed from the server
     *
     * @method detectAndSetGlobalLocaleFromDocument
     * @static
     * @return {String} detected locale
     */
    static detectAndSetClientGlobaleFromDocument() {
        let pickedLocale = document.querySelector("html").getAttribute("lang");

        if(typeof pickedLocale === "undefined" || pickedLocale === null)
            pickedLocale = i18n.defaultLocale;

        i18n.clientLocale = pickedLocale;

        return i18n.clientLocale;
    }

    /**
     * Get active locale depending on client or server request
     *
     * @method getActiveLocale
     * @static
     * @returns {string} locale
     */
    static getActiveLocale() {
        return process.domain ? process.domain.req.user.getLocale() : i18n.clientLocale;
    }
}

/**
 * Default locale
 *
 * @attribute defaultLocale
 * @type String
 * @default en
 */
i18n.defaultLocale = "en";

/**
 * Client locale
 *
 * @attribute clientLocale
 * @type String
 * @default en
 */
i18n.clientLocale = "en";

/**
 * Cached locale strings
 *
 * @attribute cachedLocaleStrings
 * @type Object
 * @default en
 */
i18n.cachedLocaleStrings = {};

i18n.readAndCacheLocaleStrings();

export default i18n;

/**
 * Translate function. You can use this method to internationalize the application.
 * Wherever a translation is needed, just import
 * {{#crossLink "shared.helper.i18n/export tr:method"}}this function{{/crossLink}} and use it.
 *
 * @method export tr
 * @param key {String} defined in the locales strings file
 * @param arguments {*} arguments of strings which can accessed in the translated string via {0}..{1}..{n}
 * @return {String} Translated string
 */
export function tr(key) {
    let locale = i18n.getActiveLocale();
    var string = i18n.cachedLocaleStrings[locale][key];

    if(typeof string !== "undefined") {
        if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) string = string.replace('{' + (i - 1) + '}', arguments[i]);
        return string;
    } else {
        return key;
    }

    return key;
}
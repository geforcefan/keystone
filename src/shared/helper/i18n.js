/**
 * i18n.js
 *
 * Helper class for i18n detection. Simultaneously it also holds the locale
 * globally.
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

import LocalesData from '../../../locales/strings';

import LanguageParser from 'accept-language-parser';

import _ from 'lodash';

/**
 * i18n helper for translations and locale detection
 *
 * @class i18n
 */
class i18n {
    /**
     * Get the current locale
     *
     * @method getActiveLocale
     * @static
     * @return {String} active locale
     */
    static getActiveLocale() {
        return i18n.currentLocale;
    }

    /**
     * Return locale strings of the active locale
     *
     * @getMessagesOfActiveLocale
     * @static
     * @return {Object} of locale strings
     */
    static getMessagesOfActiveLocale() {
        if(i18n.cachedActiveMessages === null)
            i18n.cacheActiveMessages();

        return i18n.cachedActiveMessages;
    }

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
     * Basically just picking the lang attribute from the HTML element and make
     * this global accessible via languageDetector.currentLocale.
     * The business logic of which language should picked SHOULD exclusively
     * detected server side (check server.js). The server then renders the HTML Layout
     * with the right lang attribute, so the client just have to pick the locale which is
     * passed from the server
     *
     * @method detectAndSetLocaleFromDocument
     * @static
     * @return {String} detected locale
     */
    static detectAndSetLocaleFromDocument() {
        i18n.cachedActiveMessages = null;

        let pickedLocale = document.querySelector("html").getAttribute("lang");

        if(typeof pickedLocale === "undefined" || pickedLocale === null)
            pickedLocale = i18n.defaultLocale;

        i18n.currentLocale = pickedLocale;

        i18n.cacheActiveMessages();

        return i18n.currentLocale;
    }

    /**
     * Parsing acceptLanguageString and setting the currentLocale according to the right order
     * and availability of a language defined in "locales/data.js"
     *
     * @method detectAndSetLocaleFromAcceptLanguage
     * @static
     * @param acceptLanguageString {string} string of accepted languages according to the w3 specs,
     * see at: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
     *
     * @return {String} detected locale
     */
    static detectAndSetLocaleFromAcceptLanguage(acceptLanguageString) {
        i18n.cachedActiveMessages = null;

        var pickedLocale = LanguageParser.pick(_.map(LocalesData, (val, key) => {
            return key;
        }), acceptLanguageString);

        if(pickedLocale === null)
            pickedLocale = i18n.defaultLocale;

        i18n.currentLocale = pickedLocale;

        i18n.cacheActiveMessages();

        return i18n.currentLocale;
    }

    /**
     * Cache active messages. Don´t need to flatten the messages over and over again.
     *
     * @static
     * @method cacheActiveMessages
     */
    static cacheActiveMessages() {
        i18n.cachedActiveMessages = i18n.flattenMessages(LocalesData[i18n.currentLocale]);
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
 * Current locale
 *
 * @attribute currentLocale
 * @type String
 * @default en
 */
i18n.currentLocale = i18n.defaultLocale;

/**
 * All cached translation strings
 *
 * @attribute cachedActiveMessages
 * @type Object
 * @default null
 */
i18n.cachedActiveMessages = null;

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

    console.log(process.domain);

    var string = i18n.cachedActiveMessages[key];
    if(typeof string !== "undefined") {
        if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) string = string.replace('{' + (i - 1) + '}', arguments[i]);
        return string;
    } else {
        return key;
    }
}
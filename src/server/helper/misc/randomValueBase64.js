/**
 * randomValuesBase64.js
 *
 * Generates random base64 values
 *
 * Special thanks to: Tom Pawlak
 * https://blog.tompawlak.org/generate-random-values-nodejs-javascript
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

import crypto from 'crypto';

/**
 * Generates random base64 values
 *
 * @method randomValueBase64
 * @param len {Number} number of characters
 * @returns {string} random
 */
export default function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

/**
 * test.js
 *
 * Just for testing
 *
 *
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-10
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */


import { Router, RouteMethods } from '../helper/router';

export default class Test extends Router {
    constructor() {
        super();

        this.addRoute('/test', this.test.bind(this), RouteMethods.get);
    }

    test(req, res) {
    }
}
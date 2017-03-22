/**
 * router.js
 *
 * Router helper. Inherit this class in any route.
 *
 * GitHub issue: https://github.com/geforcefan/keystone/issues/8
 * GitHub issue: https://github.com/geforcefan/keystone/issues/9
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

import Express from 'express';
import Domain from 'domain';
import { Enum } from 'enumify';

import Services from './services'

/**
 * Available router methods.
 *
 * @class RouterMethods
 * @extends Enum
 */
export class RouteMethods extends Enum {}

/**
 * get method
 *
 * @property get
 */

/**
 * post method
 *
 * @property post
 */

/**
 * delete method
 *
 * @property delete
 */
RouteMethods.initEnum(['post', 'get', 'delete']);

/**
 * Router helper. Inherit this class in any route.
 *
 * @class Router
 * @extends server.helper.Services
 */
export class Router extends Services {
    constructor() {
        super();

        this.router = Express.Router();

        // a little middleware which allows us to access request and response via process.domain.req or
        // process.domain.res in the services
        this.router.use("*", (req, res, next) => {
            console.log("Created request domain");

            let requestDomain = Domain.create();
            requestDomain.add(req);
            requestDomain.add(res);
            requestDomain.req = req;
            requestDomain.res = res;

            console.log(`Requested route: ${req.baseUrl}`);
            console.log(`Found route instance: ${this.constructor.name}`);
            requestDomain.run(next);
        });
    }

    /**
     * Add a route
     *
     * @method addRoute
     *
     * @protected
     * 
     * @param route {String} route
     * @param callback {Function} express callback
     * @param method {RouteMethods} route method
     *
     * @example
     *      this.addRoute("authenticate/", (res, req) => res.send("OK"), RouteMethods.post);
     *      this.addRoute("profile/", (res, req) => res.send("OK"), RouteMethods.get);
     */
    addRoute(route, callback, method) {
        if(!(method instanceof RouteMethods))
            throw "Argument method must be an instance of RouterMethods";

        switch(method) {
            case RouteMethods.get:
                this.router.get(route, callback);
                break;
            case RouteMethods.post:
                this.router.post(route, callback);
                break;
            case RouteMethods.delete:
                this.router.delete(route, callback);
                break;
        }
    }

    /**
     * Get express router, which is used by the routes autoloader in server.js
     *
     * @method getExpressRouter
     *
     * @returns {Express.Router}
     */
    getExpressRouter() {
        return this.router;
    }
}

/**
 * Express router, which is used by the routes autoloader in server.js
 *
 * @attribute router
 * @default null
 * @private
 * @type {null}
 */
Router.router = null;
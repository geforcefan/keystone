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

import paths from '../paths'
import path from 'path';
import fs from 'fs';

import Services from '../services/services'

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
 * Place your routes inside routes/ to register them. Your route must inherit from this class.
 * The file name is used as URL identifier (e.g. http://localhost:4000/api/{filenameWithoutExtension})
 *
 * Example directory structure
 *
 *      routes/user.js -> user
 *      routes/testyTest.js -> testyTest
 *
 * Example URLs
 *
 *      http://localhost:4000/api/user/*
 *      http://localhost:4000/api/testyTest/*
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

    /**
     * Detect all routes from the routes/ directory.
     * Each route must inherit from server.helper.Router
     *
     * @method detectRoutes
     * @static
     * @returns {Express.Router}
     */
    static detectRoutes() {
        let srcPath = paths.server.routes;

        // detect all .js files from the "routes/" directory.
        // The file name is used as URL identifier (e.g. http://localhost:4000/api/{filenameWithoutExtension})
        return fs.readdirSync(srcPath)
            .filter(file => fs.statSync(path.join(srcPath, file)).isFile())
            .map(file => {
                let apiName = file.split('.js')[0];
                console.log(`Found route: ${file}, route: /api/${apiName}/*`);

                return apiName;
            })
            .reduce((acc, apiName) =>  {
                try {
                    let route = require(path.join(paths.server.routes, apiName)).default;

                    if (!(route.prototype instanceof Router))
                        throw Error(`Router ${apiName} must inherit from Router`);

                    acc.use("/" + apiName, (new (route)).getExpressRouter())
                } catch(e) {
                    console.log(`Couldn't register router '${apiName}': ${e.message}`);
                }

                return acc;
            }, Express.Router());
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
/**
 * services.js
 *
 * Services autoloader class.
 * Inheriting from this class will make all services available in your class.
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

import path from 'path'
import fs from 'fs'
import paths from '../paths'

import _ from 'lodash'

/**
 * Services autoloader class.
 * Inheriting from this class will make all services available in your class.
 *
 * Place your services inside services/ to register them. Your service must inherit from
 * {{#crossLink "server.helper.Service"}}Service{{/crossLink}}.
 * The file name is used for the getter method names.
 *
 * Example directory structure
 *
 *      service/user.js -> getUserService
 *      service/testyTest.js -> getTestyTestService
 *
 * Example Usage
 *
 *      this.getUserService().fetchUser();
 *      this.getTestyTestService().doNothing();
 *
 * @class Services
 */
export default class Services {
    constructor() {
        // looking for all files inside "services/"
        let servicesPath = paths.server.services;

        if(!Services.servicesCache)
            Services.servicesCache = fs.readdirSync(servicesPath)
                .filter(file => fs.statSync(path.join(servicesPath, file)).isFile())
                .reduce((acc, file) => {
                    let serviceName = file.split(".js")[0];
                    let methodName = `get${_.upperFirst(serviceName)}Service`;
                    let service = require(path.join(servicesPath, file)).default;

                    console.log(`Found service: ${file}, getter: ${methodName}`);

                    acc[`${service.name}Services`] = {
                        methodName: methodName,
                        object: service
                    };
                    return acc;
                }, {});

        // make the service getter methods available in "this"
        _(Services.servicesCache).omit([`${this.constructor.name}${Object.getPrototypeOf(this.constructor).name}`]).forEach((service, serviceName) => this[service.methodName] = () => {
            if(Services.serviceInstances[service.methodName])
                return Services.serviceInstances[service.methodName];
            else
                return Services.serviceInstances[service.methodName] = new service.object();
        });
    }
}

/**
 * Cached services
 *
 * @static
 * @attribute servicesCache
 * @default null
 * @type {Object}
 */
Services.servicesCache = null;

/**
 * Cached service instances
 *
 * @static
 * @attribute serviceInstances
 * @default null
 * @type {Object}
 */
Services.serviceInstances = {};
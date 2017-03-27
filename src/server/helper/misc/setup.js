/**
 * setup.js
 *
 * Setup helper. This helper will check for updates and invokes them
 *
 *
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-11
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import path from 'path';
import fs from 'fs';
import paths from '../paths'

import pad from 'pad-number';

import SystemModel from '../../models/system'

/**
 *
 * Setup helper. This helper will check for updates and invokes them
 *
 * @class Setup
 */
export default class Setup {
    /**
     * Converts a date to the YYYYMMDD format for directory comparision (e.g. /setup/20170301)
     *
     * @method convertDateToDirectoryFormat
     * @private
     * @static
     * @param date {Date} date which should be converted
     * @return {String} date in YYYYMMDD format
     */
    static convertDateToDirectoryFormat(date) {
        return [date].reduce((acc, d) => {
            return `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}`;
        }, "");
    }

    /**
     * Executing the setup and update files
     *
     * @method execSetup
     * @async
     * @private
     * @static
     * @param system {server.models.SystemSchema} Needed for the lastUpdateDate information
     * @param success {Function} success callback
     * @param error {Function} error callback
     */
    static execSetup(system, success, error) {
        console.log(
            system.lastUpdateDate ?
                `Last updated date at ${system.lastUpdateDate}` :
                "There was no update done ever. Fresh installation is starting."
        );

        // Its easier to bring all comparision to one format and set the
        // date of last update when no update was done before to 01/01/1970
        if (!system.lastUpdateDate)
            system.lastUpdateDate = new Date("1970-01-01");

        let todayDate = Setup.convertDateToDirectoryFormat(new Date());
        let lastUpdateDate = Setup.convertDateToDirectoryFormat(system.lastUpdateDate);

        let setupPath = paths.server.setup;

        fs.readdirSync(setupPath)
            .filter(dir => fs.statSync(path.join(setupPath, dir)).isDirectory())
            .filter(dir => parseInt(dir) > parseInt(lastUpdateDate) && parseInt(dir) <= parseInt(todayDate))
            .reduce((acc, dir) => {
                return acc.concat(fs.readdirSync(path.join(setupPath, dir))
                    .map(file => path.join(dir, file))
                    .filter(file => fs.statSync(path.join(setupPath, file)).isFile())
                    .map(file => {
                        console.log(`Found update file: ${file}`);
                        return file.split('.js')[0];
                    })
                )
            }, [])
            .map(file => {
                let setupFunction = require(path.join(setupPath, file)).default;

                if (typeof setupFunction === "function") return setupFunction;
                else null;
            })
            .filter(fn => fn)
            .reduce((acc, fn) => {
                return acc.then((result) => new Promise((resolve, reject) => fn(resolve, reject)))
            }, new Promise(resolve => resolve(true)))
            .then(noUpdateFound => {
                if (noUpdateFound) {
                    console.log(`No updates found`);
                } else {
                    // update the last update date entry in the database
                    SystemModel.findOne({}, (err, system) => {
                        system.lastUpdateDate = new Date();
                        return system.save();
                    });

                    console.log(`Installation success at ${new Date()}`);
                }

                success();
            })
            .catch(err => error("Installation failed"));
    }

    /**
     * This setup helper will check for updates and invokes them
     *
     * @method detectAndRunUpdates
     * @static
     * @async
     * @param success {Function} success callback
     * @param error {Function} error callback
     */
    static detectAndRunUpdates(success, error) {
        console.log("Checking when the last update accomplished");

        // Load system information, create if no entry exists
        SystemModel.findOne({})
            .then(system => !system ? new SystemModel({
                lastUpdateDate: new Date("1970-01-01")
            }).save() : system)
            .then(system => {
                Setup.execSetup(system, success, error);
            });
    }
}

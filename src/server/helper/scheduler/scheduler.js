/**
 * scheduler.js
 *
 * A Scheduler helper. Detects, registers and starts schedules which are located in schedules/.
 * The filename of the schedule is used for the global registration. All schedules must inherit
 * from {{#crossLink "server.helper.AbstractSchedule"}}AbstractSchedule{{/crossLink}}.
 *
 *      schedules/failedMails.js -> failedMails
 *
 * You can start or terminate any schedule by importing this class an calling the static methods
 *
 *      import Scheduler from './helper/misc/scheduler'
 *
 *      Scheduler.start(scheduleName);
 *      Scheduler.terminate(scheduleName);
 *
 * Example usage to start a schedule
 *
 *      Scheduler.start("failedMails");
 *
 * Example usage to terminate a schedule
 *
 *      Scheduler.terminate("failedMails");
 *
 *
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-27
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import fs from 'fs'
import path from 'path'
import paths from '../paths'
import AbstractSchedule from './abstractSchedule'

/**
 * A Scheduler helper. Detects, registers and starts schedules which are located in schedules/.
 * The filename of the schedule is used for the global registration. All schedules must inherit
 * from {{#crossLink "server.helper.AbstractSchedule"}}AbstractSchedule{{/crossLink}}.
 * 
 *      schedules/failedMails.js -> failedMails
 * 
 * You can start or terminate any schedule by importing this class an calling the static methods
 *
 *      import Scheduler from './helper/misc/scheduler'
 *      
 *      Scheduler.start(scheduleName);
 *      Scheduler.terminate(scheduleName);
 *      
 * Example usage to start a schedule
 *
 *      Scheduler.start("failedMails");
 * 
 * Example usage to terminate a schedule
 * 
 *      Scheduler.terminate("failedMails");
 *      
 * @class Scheduler
 */
class Scheduler {
    /**
     * Starts a global registered schedule
     *
     * @method start
     * @param scheduleName {String} schedule name
     * @static
     */
    static start(scheduleName) {
        if(!Scheduler.schedules[scheduleName] || typeof Scheduler.schedules[scheduleName] === "undefined")
            return console.log(`Couldn't find and start schedule [${scheduleName}]`);

        if(!Scheduler.schedules[scheduleName].isRunning) {
            Scheduler.schedules[scheduleName].start();
            Scheduler.schedules[scheduleName].isRunning = true;
        }
    }

    /**
     * Terminates a global registered schedule
     *
     * @method terminate
     * @param scheduleName {String} schedule name
     * @static
     */
    static terminate(scheduleName) {
        if(!Scheduler.schedules[scheduleName] || typeof Scheduler.schedules[scheduleName] === "undefined")
            return console.log(`Couldn't find and terminate schedule [${scheduleName}]`);

        if(Scheduler.schedules[scheduleName].isRunning) {
            Scheduler.schedules[scheduleName].terminate();
        }
    }

    /**
     * Registers a global schedule
     *
     * @method addSchedule
     * @static
     * @private
     * @param scheduleName {String} schedule name
     * @param schedule {server.helper.AbstractSchedule} schedule object
     */
    static addSchedule(scheduleName, schedule) {
        Scheduler.schedules[scheduleName] = schedule;
    }

    /**
     * Detects and starts global schedules by fetching and validating all schedules/*.js files
     */
    static detectAndStartSchedules() {
        fs.readdirSync(paths.server.schedules)
            .filter(file => fs.statSync(path.join(paths.server.schedules, file)).isFile())
            .map(file => {
                let scheduleName = file.split('.js')[0];
                console.log(`Found schedule: ${file}`);

                return scheduleName;
            })
            .forEach(scheduleName => {
                try {
                    let schedule = require(path.join(paths.server.schedules, scheduleName)).default;

                    if (!(schedule.prototype instanceof AbstractSchedule))
                        throw Error(`Schedule ${scheduleName} must inherit from AbstractSchedule`);

                    Scheduler.addSchedule(scheduleName, new schedule(scheduleName));
                    Scheduler.start(scheduleName);
                } catch(e) {
                    console.log(`Couldn't register schedule '${scheduleName}': ${e.message}`);
                }
            })
    }
}

/**
 * All global registered schedules
 *
 * @attribute schedules
 * @static
 * @type {Object}
 * @default {}
 */
Scheduler.schedules = {};

export default Scheduler;
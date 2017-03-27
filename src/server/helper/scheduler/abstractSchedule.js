/**
 * abstractSchedule.js
 *
 * An abstract class which must be inherited in all schedules.
 * More information: {{#crossLink "server.helper.Scheduler"}}Scheduler{{/crossLink}}
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

/**
 * An abstract class which must be inherited in all schedules.
 * More information: {{#crossLink "server.helper.Scheduler"}}Scheduler{{/crossLink}}
 *
 * @class AbstractSchedule
 * @abstract
 */
class AbstractSchedule {
    constructor(scheduleName) {
        if (new.target === AbstractSchedule) {
            throw new TypeError("Cannot construct AbstractSchedule instances directly");
        }

        if (typeof this.start !== "function") {
            throw new TypeError("Must override method 'start'");
        }

        if (typeof this.terminate !== "function") {
            throw new TypeError("Must override method 'terminate'");
        }

        this.isRunning = AbstractSchedule.isRunning;
    }

    /**
     * Start schedule
     *
     * @method start
     * @abstract
     */
    start() {
        this.isRunning = true;
    }

    /**
     * Terminate schedule
     *
     * @method terminate
     * @abstract
     */
    terminate() {
        this.isRunning = false;
    }
}

/**
 * Is schedule running
 *
 * @attribute isRunning
 * @type Boolean
 * @default false
 */
AbstractSchedule.isRunning = false;

export default AbstractSchedule;
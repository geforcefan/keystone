/**
 * failedMails.js
 *
 * Failed mails scheduler which is checking and trying to send failed mails.
 *
 * @namespace server.schedules
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-27
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import AbstractSchedule from '../helper/scheduler/abstractSchedule'
import ConfigServer from '../../../config/server'
import FailedMailModel from '../models/failedMail'

import _ from 'lodash'

import timers from 'timers'
import emailjs from 'emailjs'

/**
 * Failed mails scheduler which is checking and trying to send failed mails.
 *
 * @class FailedMails
 * @extends server.helper.AbstractSchedule
 */
export default class FailedMails extends AbstractSchedule {
    constructor() {
        super();

        this.checkTimer = FailedMails.checkTimer;
    }

    /**
     * Fetch all failed mails
     *
     * @method fetchFailedMails
     * @param callback {Function}
     */
    fetchFailedMails(callback) {
        FailedMailModel.find({
            retried: { $lte: ConfigServer.email.maxRetries }
        }, (err, failedMails) => {
            if(err)
                return callback(err, null);

            console.log(`FailedMails: Found ${failedMails.length} failed mails`);
            return callback(null, failedMails);
        });
    }

    /**
     * Send a failed mail
     *
     * @method sendMail
     * @param failedMail {server.models.FailedMailModel} failed mail
     */
    sendMail(failedMail) {
        let mailServer = emailjs.server.connect(ConfigServer.email.server);
        let mailSendObject = Object.assign(_.omit(failedMail.toObject(), ["_id", "__v"]), {
            from: ConfigServer.email.from
        });

        mailServer.send(mailSendObject, err => {
            if (err) {
                let retriesLeft = ConfigServer.email.maxRetries - (failedMail.retried + 1);
                console.log(`FailedMails: Couldn't Send mail with subject [${failedMail.subject}] to [${failedMail.to}], ${retriesLeft} retires left: Error [${err.message}]`);

                return failedMail.set({
                    retried: failedMail.retried + 1
                }).save();
            } else {
                console.log(`FailedMails: Send mail with subject [${failedMail.subject}] successfully to [${failedMail.to}]: "${failedMail.text}"`);

                return failedMail.remove();
            }
        });
    }

    /**
     * Check failed mails and try to send them
     *
     * @method checkFailedMails
     */
    checkFailedMails() {
        new Promise(resolve => resolve())
            .then(() => new Promise((resolve, reject) =>
                this.fetchFailedMails((err, failedMails) => (!failedMails || err) ? reject(err) : resolve(failedMails))))
            .then(failedMails => new Promise((resolve, reject) => failedMails.length ? resolve(failedMails) : reject()))
            .then(failedMails => new Promise((resolve, reject) => failedMails.forEach(failedMail =>
                this.sendMail(failedMail))))
            .catch(err => {
                if(!err) {
                    console.log("FailedMails: No failed mails left, terminating schedule");
                    this.terminate();
                }
                else
                    console.log("FailedMails:", err.message);
            });

        console.log("FailedMails: Looking for failed mails");
    }

    /**
     * Start failed mails schedule
     *
     * @method start
     * @override
     */
    start() {
        super.start();

        console.log("FailedMails: Scheduler started");
        this.checkTimer = timers.setInterval(this.checkFailedMails.bind(this), ConfigServer.email.retryInterval * 1000);
    }

    /**
     * terminate failed mails schedule
     *
     * @method terminate
     * @override
     */
    terminate() {
        super.terminate();

        timers.clearInterval(this.checkTimer);
        console.log("FailedMails: Scheduler terminated");
    }
}

/**
 * Mail check timer
 *
 * @attribute checkTimer
 * @type Node.Timers
 * @default null
 */
FailedMails.checkTimer = null;
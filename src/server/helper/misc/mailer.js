/**
 * mailer.js
 *
 * Mailer helper class which provides a method to send a mail without concerning
 * about the sender addresses, subject, template and mail layout
 *
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-22
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import ConfigServer from '../../../../config/server'

import emailjs from 'emailjs'
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'
import paths from '../paths'

import htmlToText from 'html-to-text'

import i18n from '../../../shared/helper/i18n'
import { tr } from '../../../shared/helper/i18n'

import { Enum } from 'enumify';

import Scheduler from '../scheduler/scheduler'

import FailedMailModel from '../../models/failedMail'

export class MailType extends Enum {}
MailType.initEnum(require('./../../definitions/mailsTypes').default);

/**
 * Mailer helper class which provides a method to send a mail without concerning
 * about the sender addresses, subject, template and mail layout
 *
 * @class Mailer
 */
export class Mailer {
    /**
     * Sends a mail without concerning
     * about the sender addresses, subject, template and mail layout
     *
     * @method sendMail
     * @static
     * @param mailType {MailType} mail type defined in server/definitions/mails.js
     * @param variables {Object} template variables
     * @param recipients {Array<String>} array of recipients (email addresses)
     */
    static sendMail(mailType, variables, recipients) {
        if(!(mailType instanceof MailType))
            throw Error("Argument 'mailType' must be an instance of MailType");

        let mailsPath = path.join(paths.locales, i18n.getActiveLocale(), "mails");

        let layoutTemplate = fs.readFileSync(path.join(mailsPath, "layout.ejs"), "utf8");
        let contentTemplate = fs.readFileSync(path.join(mailsPath, `${mailType.name}.ejs`), "utf8");

        let content = ejs.render(contentTemplate, variables);
        let emailHTML = ejs.render(layoutTemplate, { content });

        let mailServer = emailjs.server.connect(ConfigServer.email.server);
        let mailSendObject = {
            from: ConfigServer.email.from,
            text: htmlToText.fromString(emailHTML),
            to: recipients.join(","),
            subject: tr(`email.${mailType.name}.subject`),
            attachment: [{
                data: emailHTML,
                alternative: true
            }]
        };

        mailServer.send(mailSendObject, err => {
            if(err) {
                console.log(`Couldn't Send mail with subject [${mailSendObject.subject}] to [${mailSendObject.to}]: Error [${err.message}]`);

                // store failed mails in the database
                new FailedMailModel(mailSendObject).save((err, mail) => {
                    // start failed mail scheduler
                    Scheduler.start("failedMails");
                });
            } else
                console.log(`Send mail with subject [${mailSendObject.subject}] successfully to [${mailSendObject.to}]: "${mailSendObject.text}"`);
        })
    }
}
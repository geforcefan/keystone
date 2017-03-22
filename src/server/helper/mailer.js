/**
 * mailer.js
 *
 * Mailer helper which provides a function to send a mail without concerning
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

import ConfigServer from '../../../config/server'

import emailjs from 'emailjs'
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'

import { i18n, tr } from '../../shared/helper/i18n'

import { Enum } from 'enumify';

export class MailType extends Enum {}
MailType.initEnum(require('./../definitions/mailsTypes').default);

/**
 * Sends a mail without concerning
 * about the sender addresses, subject, template and mail layout
 *
 * @method export sendMail
 * @param mailType {MailType} mail type defined in server/definitions/mails.js
 * @param variables {Object} template variables
 * @param recipients {Array<String>} array of recipients (email addresses)
 */
export function sendMail(mailType, variables, recipients) {
    if(!(mailType instanceof MailType))
        throw Error("Argument 'mailType' must be an instance of MailType");

   /* let mailsPath = path.join(ConfigServer.fs.rootDirectory, "locales", "mails", i18n.getActiveLocale());

    let layoutTemplate = fs.readFileSync(path.join(mailsPath, "layout.ejs"), "utf8");
    let contentTemplate = fs.readFileSync(path.join(mailsPath, `${mailType.name}.ejs`), "utf8");

    let content = ejs.render(contentTemplate, variables);
    let emailHTML = ejs.render(layoutTemplate, { content });
*/
    console.log(emailHTML);

    //html = ejs.render('<%= people.join(", "); %>', {people: people});
}
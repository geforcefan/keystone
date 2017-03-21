/**
 * userGroups.js
 * Installation file for user groups.
 * Setting up initial groups.
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

import UserGroupModel from '../../models/userGroup'
import _ from 'lodash'

/**
 * Setting up initial groups
 *
 * @param success Function
 * @param error Function
 */
export default function(success, error) {
    let guestGroup = new UserGroupModel({
        name: "guest",
        level: 1000
    });

    let blockedGroup = new UserGroupModel({
        name: "blocked",
        level: 950
    });

    let userGroup = new UserGroupModel({
        name: "user",
        level: 700
    });

    let adminGroup = new UserGroupModel({
        name: "admin",
        level: 0,
        permissions: {
            hasAllPermissions: true
        }
    });

    console.log("=================================");
    console.log("Inserting groups to the Database");
    console.log("=================================");

    Promise.all([
        new Promise(resolve => guestGroup.save(resolve)),
        new Promise(resolve => userGroup.save(resolve)),
        new Promise(resolve => blockedGroup.save(resolve)),
        new Promise(resolve => adminGroup.save(resolve))
    ]).then(result => {
        var errors = result.map(err => { return err ? err.message : null })
            .filter(err => err);

        if(_.size(errors)) {
            errors.forEach(error => console.log(error));
            error();
        } else {
            console.log("Inserted all groups successfully");
            success();
        }
    });
}
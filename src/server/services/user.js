/**
 * user.js
 *
 * User servive
 *
 *
 * @namespace server.services
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-15
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Service from '../helper/service'
import { ErrorCodes } from '../helper/errorResponse'

import jwt from 'jwt-simple';
import ConfigServer from './../../../config/server';

import UserModel from '../models/user'
import UserGroupModel from '../models/userGroup'

/**
 * User service
 *
 * @class User
 * @extends server.helper.Service
 */
export default class User extends Service {
    authenticate(loginData, callback) {
        return new Promise(resolve => resolve())
            .then(result => new Promise((resolve, reject) => UserModel.findOne({
                name: loginData.name,

            }, (err, user) => (err || !user ? reject([ErrorCodes.authenticationUserNotFound]) : resolve(user)))))
            .then(user => new Promise((resolve, reject) => user.comparePassword(loginData.password, (err, isMatch) => {
                if(isMatch && !err)
                    return resolve(user);

                return reject([ErrorCodes.authenticationWrongPassword]);
            })))
            .then(user => new Promise((resolve, reject) => {
                if(user.blocked)
                    return reject([ErrorCodes.authenticationUserBlocked]);
                if(!user.active)
                    return reject([ErrorCodes.authenticationUserInactive]);

                return resolve(user);
            }))
            .then(user => new Promise(resolve => resolve(jwt.encode(user, ConfigServer.auth.secret))))
            .then(token => callback(null, { token: `JWT ${token}` }))
            .catch(err => callback(err, null));
    }
    
    register(registrationData, callback) {
        return new Promise(resolve => resolve())
            .then(result => new Promise((resolve, reject) =>
                (!registrationData.name || !registrationData.email || !registrationData.password) ?
                    reject([ErrorCodes.registrationFillAllFields]) :
                    resolve()
            ))
            .then(result => new Promise(resolve => UserGroupModel.findOne({ name: "user" }, (err, group) => resolve(group))))
            .then(group => new Promise((resolve, reject) => new UserModel({
                name: registrationData.name,
                password: registrationData.password,
                email: registrationData.email,
                groupID: group.id
            }).save((err, user) => err ? reject([ErrorCodes.registrationUsernameOrEmailExists]) : resolve(user))))
            .then(user => callback(null, { id: user.id }))
            .catch(args => callback(args, null));
    }

    modify(userID, modifyData, callback) {
        // check permissions first
        return (['name', 'email', 'password', 'groupID', 'profile']).reduce((promise, field) =>
            promise.then((userChanges) => new Promise((resolve, reject) => {
                if(modifyData[field]) {
                    if(this.getUser().isMe(userID) && !this.getUser().isAllowed(`user.set.own.${field}`))
                        return reject([ErrorCodes.operationNotAllowed, `user.set.own.${field}`]);

                    if(!this.getUser().isMe(userID) && !this.getUser().isAllowed(`user.set.other.${field}`))
                        return reject([ErrorCodes.operationNotAllowed, `user.set.other.${field}`]);

                    if(field === "password") {
                        return UserModel.generatePasswordHash(modifyData[field], (hash) => {
                            userChanges[field] = hash;
                            return resolve(userChanges);
                        }, (err) => resolve(userChanges))
                    } else {
                        userChanges[field] = modifyData[field];
                        return resolve(userChanges);
                    }
                }
                return resolve(userChanges);
            })), new Promise(resolve => resolve({})))

            // find the target group when a change is provided
            .then(userChanges => new Promise((resolve, reject) => UserGroupModel.findById(userChanges.groupID, (err, targetGroup) =>
                resolve({ targetGroup, userChanges }))))

            // find target user
            .then(result => new Promise((resolve, reject) => UserModel.findById(userID, (err, targetUser) =>
                (!targetUser || err) ? reject([ErrorCodes.userNotFound, userID]) : resolve(Object.assign(result, { targetUser })))))

            // find target users group
            .then(result => new Promise((resolve, reject) => UserGroupModel.findById(result.targetUser.groupID, (err, sourceGroup) =>
                (!sourceGroup || err) ? reject([ErrorCodes.userGroupNotFound, sourceGroup.groupID]) : resolve(Object.assign(result, { sourceGroup })))))

            .then(result => new Promise((resolve, reject) => {
                // target users group should be changed, but target group is not found. Wrong groupID is provided for change
                if(result.userChanges.groupID && !result.targetGroup)
                    reject([ErrorCodes.userGroupNotFound, result.userChanges.groupID]);

                // we can´t modify a user with an equal less level than our level, except we gonna modify us
                else if(result.sourceGroup.level <= this.getUser().getGroup().level && !this.getUser().isMe(userID))
                    reject([ErrorCodes.userModifyCantModifyUserWithLessEqualLevelThanMe]);

                // we also can´t assign a group with less or equal level than our level
                else if(result.userChanges.groupID && result.targetGroup.level <= this.getUser().getGroup().level)
                    reject([ErrorCodes.userModifyCantAssignGroupWithLessEqualLevelThanMe]);

                else resolve(result.userChanges);
            }))

            // update the user record
            .then(userChanges => new Promise((resolve, reject) => UserModel.findByIdAndUpdate(userID, userChanges, (err, user) => {
                if(err)
                    return reject([ErrorCodes.registrationUsernameOrEmailExists]);
                if(!user)
                    return reject([ErrorCodes.userNotFound, userID]);
                else
                    return resolve(user);
            })))

            // success or failure
            .then(user => callback(null, {userID: userID}))
            .catch(args => callback(args, null));
    }
}
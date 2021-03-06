/**
 * user.js
 *
 * User business logic
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

import Service from '../helper/services/service'
import { ErrorCodes } from '../helper/response/errorResponse'

import jwt from 'jwt-simple';
import ConfigServer from './../../../config/server';

import UserModel from '../models/user'
import UserGroupModel from '../models/userGroup'

import Mongoose from '../helper/misc/mongoose'

import randomValueBase64 from '../helper/misc/randomValueBase64'
import { MailType, Mailer } from  '../helper/misc/mailer'

/**
 * User business logic
 *
 * @class User
 * @extends server.helper.Service
 */
export default class User extends Service {
    /**
     * Fetch an active user. This method should always used to fetch a user, except
     * you need to activate a user.
     *
     * @method getActiveUserByID
     * @async
     *
     * @param userID {String} user id
     * @param callback {Function} (err, user)
     *
     * @returns {Function}
     */
    getActiveUserByID(userID, callback) {
        // validate user id
        if(!Mongoose.Types.ObjectId.isValid(userID))
            return callback([ErrorCodes.invalidObjectID, userID], null);

        UserModel.findOne({
            _id: userID,
            active: true
        }, (err, user) => {
            if (err)
                return callback([err], null);
            if (!user)
                return callback([ErrorCodes.userNotFound, userID], null);

            return callback(null, user);
        });
    };

    /**
     * Authentication logic
     *
     * @method authenticate
     * @async
     *
     * @param loginData {Object} login data
     * @param loginData.name {String} username
     * @param loginData.password {String} password
     * @param callback {Function} (err, token)
     *
     * @returns {Promise}
     */
    authenticate(loginData, callback) {
        return new Promise(resolve => resolve())
            .then(result => new Promise((resolve, reject) => UserModel.findOne({
                name: loginData.name,
                active: true

            }, (err, user) => (err || !user ? reject([ErrorCodes.authenticationUserNotFound]) : resolve(user)))))
            .then(user => new Promise((resolve, reject) => user.comparePassword(loginData.password, (err, isMatch) => {
                if(isMatch && !err)
                    return resolve(user);

                return reject([ErrorCodes.authenticationWrongPassword]);
            })))
            .then(user => new Promise((resolve, reject) => {
                if(!user.active)
                    return reject([ErrorCodes.authenticationUserInactive]);

                return resolve(user);
            }))
            .then(user => new Promise(resolve => resolve(jwt.encode(user, ConfigServer.auth.secret))))

            // success or failure
            .then(token => callback(null, { token: `JWT ${token}` }))
            .catch(err => callback(err, null));
    }

    /**
     * Registration logic
     *
     * @method register
     * @async
     *
     * @param registrationData {Object} registration data
     * @param registrationData.name {String} username
     * @param registrationData.email {String} email
     * @param registrationData.password {String} password
     * @param callback {Function} (err, success)
     *
     * @returns {Promise}
     */
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
            .then(user => callback(null, { registered: true }))
            .catch(args => callback(args, null));
    }

    /**
     * User modification logic
     *
     * @method modify
     * @async
     * 
     * @param userID {String} user id of the user which should modified
     * @param modificationData {Object} optional, modification data
     * @param modificationData.name {String} optional, username
     * @param modificationData.email {String} optional, email
     * @param modificationData.password {String} optional, password
     * @param modificationData.groupID {String} optional, groupID
     * @param modificationData.profile {server.models.UserProfileSchema} optional, profile
     * @param callback {Function} (err, success)
     *
     * @returns {Promise}
     */
    modify(userID, modificationData, callback) {
        // check permissions first
        return (['name', 'email', 'password', 'groupID', 'profile']).reduce((promise, field) =>
            promise.then((userChanges) => new Promise((resolve, reject) => {
                if(modificationData[field]) {
                    if(this.getUser().isMe(userID) && !this.getUser().isAllowed(`user.set.own.${field}`))
                        return reject([ErrorCodes.operationNotAllowed, `user.set.own.${field}`]);

                    if(!this.getUser().isMe(userID) && !this.getUser().isAllowed(`user.set.other.${field}`))
                        return reject([ErrorCodes.operationNotAllowed, `user.set.other.${field}`]);

                    if(field === "password") {
                        return UserModel.generatePasswordHash(modificationData.password, (hash) => {
                            userChanges.password = hash;
                            return resolve(userChanges);
                        }, (err) => resolve(userChanges))
                    } else {
                        userChanges[field] = modificationData[field];
                        return resolve(userChanges);
                    }
                }
                return resolve(userChanges);
            })), new Promise(resolve => resolve({})))

            // find the target group when groupID is provided
            .then(userChanges => new Promise((resolve, reject) => UserGroupModel.findById(userChanges.groupID, (err, targetGroup) =>
                resolve({ targetGroup, userChanges }))))

            // find target user
            .then(result => new Promise((resolve, reject) => this.getActiveUserByID(userID, (err, targetUser) =>
                (err) ? reject(err) : resolve(Object.assign(result, { targetUser })))))

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

                else resolve(result);
            }))

            // update the user record
            .then(result => new Promise((resolve, reject) => {
                result.targetUser.set(result.userChanges);
                result.targetUser.save((err, user) => {
                    if (err)
                        return reject([err, ErrorCodes.registrationUsernameOrEmailExists]);
                    if (!user)
                        return reject([ErrorCodes.userNotFound, userID]);
                    else
                        return resolve(user);
                });
            }))

            // success or failure
            .then(user => callback(null, { modified: true }))
            .catch(args => callback(args, null));
    }

    /**
     * Activate user account
     *
     * @method activateAccount
     * @async
     *
     * @param code {String} activation code
     * @param token {String} activation token
     * @param callback {Function} (err, success)
     *
     * @returns {*}
     */
    activateAccount(code, token, callback) {
        try {
            // decode token
            token = new Buffer(token, "base64").toString("ascii");
            let payload = jwt.decode(token, (ConfigServer.user.activation.secret + code));

            let currentDate = new Date();
            let expireDate = new Date(payload.expires);

            // is the token expired?
            if(currentDate > expireDate)
                callback([ErrorCodes.userActivateTokenExpired], null);

            UserModel.findById(payload.id, (err, user) => {
                if(err || !user)
                    return callback([ErrorCodes.userActivateFailed], null);
                if(user.active)
                    return callback([ErrorCodes.userActivateUserAlreadyActive], null);

                user.set({
                    active: true
                });
                user.save((err, user) => {
                    if(err || !user)
                        return callback([ErrorCodes.userActivateFailed], null);

                    resolve({
                        userActivated: true
                    });
                });
            });
        } catch(e) {
            console.log(e);
            return callback([ErrorCodes.userActivateFailed], null);
        }
    }

    /**
     * Generate and send activation code. If user is not found, this won´t provide any error information.
     * This method will always return "ok".
     *
     * @method generateAndSendActivationCode
     * @async
     *
     * @param email {String} user email address
     * @param callback {Function} (err, success)
     *
     * @returns {Promise}
     */
    generateAndSendActivationCode(email, callback) {
        return new Promise(resolve => resolve())
            // get user, but don´t return any errors, when the user is not found for security reasons
            .then(() => new Promise((resolve, reject) =>
                UserModel.findOne({ email }, (err, user) => resolve(user))))

            // generate activation code and token
            .then(user => new Promise(resolve => {
                if(!user)
                    return resolve();

                let payload = {
                    id: user.id,
                    expires: new Date((new Date().getTime()) + ConfigServer.user.activation.expireTime * 1000),
                    code: randomValueBase64(8)
                };

                let activationToken = jwt.encode(payload, ConfigServer.user.activation.secret + payload.code);
                activationToken = new Buffer(activationToken).toString('base64');

                console.log(`Requested activation code for account ${email}: ${payload.code}`);
                console.log(`Activation token: [${activationToken}]`);
                console.log(`Token will be expired on ${payload.expires}`);

                Mailer.sendMail(MailType.userActivation, {
                    code: payload.code,
                    token: activationToken,
                    url: null
                }, [email]);

                return resolve(activationToken);
            }))

            .then(user => callback(null, {
                emailSent: true
            }))
    }
}
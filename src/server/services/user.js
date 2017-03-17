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

import Service from '../helper/service'
import { ErrorCodes } from '../helper/errorResponse'

import jwt from 'jwt-simple';
import ConfigServer from './../../../config/server';

import UserModel from '../models/user'
import UserGroupModel from '../models/userGroup'

import _ from 'lodash'

/**
 * User business logic
 *
 * @class User
 * @extends server.helper.Service
 */
export default class User extends Service {
    /**
     * Get public profile of any user
     *
     * @method getProfile
     * @async
     * @param userID {String} profile owner
     * @param callback {Function} (err, result)
     * @returns {Promise}
     */
    getProfile(userID, callback) {
        return new Promise(resolve => resolve())
             // check permission
            .then(() => new Promise((resolve, reject) => {
                if(!this.getUser().isAllowed("user.profile.information"))
                    reject([ErrorCodes.operationNotAllowed, "user.profile.information"]);

                return resolve();
            }))

            // get user
            .then(() => new Promise((resolve, reject) =>
                UserModel.findById(userID, (err, user) => err ? reject([err]) : resolve(user))))

            // get number of followers and followings
            .then((user) => Promise.all([
                new Promise((resolve, reject) =>
                    UserModel.count({
                        _id: { $in: user.profile.followingUsers },
                        active: true,
                        blocked: false
                    }, (err, following) => err ? reject([err]) : resolve({ following }))),
                new Promise((resolve, reject) =>
                    UserModel.count({
                        "profile.followingUsers": userID,
                        active: true,
                        blocked: false
                    }, (err, followed) => err ? reject([err]) : resolve({ user, followed })))
            ]))

            // prepare profile data
            .then(result => new Promise(resolve => {
                result = result.reduce((acc, res) => Object.assign(acc, res), {});

                let profileData = {
                    name: result.user.name,
                    displayName: result.user.profile.displayName,
                    birthday: result.user.profile.birthday,
                    description: result.user.profile.description,
                    location: result.user.profile.location,
                    socialLinks: result.user.profile.socialLinks,
                    playedGames: result.user.profile.playedGames,
                    following: result.following,
                    followed: result.followed
                };

                resolve(profileData);
            }))

            // success or failure
            .then(profileData => callback(null, profileData ))
            .catch(args => callback(args, null))
    }

    /**
     * User following or unfollowing logic
     *
     * @method followOrUnfollow
     * @async
     * @param userID {String} user id to follow / unfollow
     * @param unfollow {Boolean} follow or unfollow user
     * @param callback {Function} (err, success)
     *
     * @returns {Promise}
     */
    followOrUnfollow(userID, unfollow, callback) {
        return new Promise(resolve => resolve())
            // check permission
            .then(() => new Promise((resolve, reject) => {
                if(!this.getUser().isAllowed("user.follow.account"))
                    reject([ErrorCodes.operationNotAllowed, "user.follow.account"]);

                return resolve();
            }))

            // get requestee user
            .then(() => new Promise((resolve, reject) =>
                UserModel.findById(this.getUser().id, (err, user) => err ? reject([err]) : resolve(user))))

            // follow or unfollow userID
            .then(user => new Promise((resolve, reject) => {
                if(unfollow)
                    user.profile.followingUsers = _.filter(user.profile.followingUsers, followingUserID => followingUserID !== userID);
                else if(!user.profile.followingUsers.includes(userID))
                    user.profile.followingUsers.push(userID);

                user.set({
                    profile: {
                        followingUsers: user.profile.followingUsers
                    }
                });
                user.save((err, user) => err ? reject([err]) : resolve(user));
            }))

            // success or failure
            .then(user => callback(null, { followingUsers: user.profile.followingUsers }))
            .catch(args => callback(args, null))
    }

    /**
     * Authentication logic
     *
     * @method authenticate
     * @async
     * @param loginData {Object} login data
     * @param loginData.name {String} username
     * @param loginData.password {String} password
     *
     * @param callback {Function} (err, success)
     * @returns {Promise}
     */
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

    /**
     * Registration logic
     *
     * @method register
     * @async
     * @param registrationData {Object} registration data
     * @param registrationData.name {String} username
     * @param registrationData.email {String} email
     * @param registrationData.password {String} password
     *
     * @param callback {Function} (err, success)
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
            .then(user => callback(null, { id: user.id }))
            .catch(args => callback(args, null));
    }

    /**
     * User modification logic
     *
     * @method modify
     * @async
     * @param userID {String} user id of the user which should modified
     * @param modificationData {Object} optional, modification data
     * @param modificationData.name {String} optional, username
     * @param modificationData.email {String} optional, email
     * @param modificationData.password {String} optional, password
     * @param modificationData.groupID {String} optional, groupID
     * @param modificationData.profile {UserProfileSchema} optional, profile
     *
     * @param callback {Function} (err, success)
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
                        return UserModel.generatePasswordHash(modificationData[field], (hash) => {
                            userChanges[field] = hash;
                            return resolve(userChanges);
                        }, (err) => resolve(userChanges))
                    } else {
                        userChanges[field] = modificationData[field];
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
            .then(user => callback(null, {userID: userID}))
            .catch(args => callback(args, null));
    }
}
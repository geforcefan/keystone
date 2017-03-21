/**
 * user.js
 *
 * User profie business logic
 *
 *
 * @namespace server.services
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-21
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Service from '../helper/service'
import { ErrorCodes } from '../helper/errorResponse'

import UserModel from '../models/user'

import Mongoose from '../helper/mongoose'

import _ from 'lodash'

/**
 * User profile business logic
 *
 * @class UserProfile
 * @extends server.helper.Service
 */
export default class UserProfile extends Service {
    /**
     * Get all subscriptions of a user
     *
     * @method getSubscriptions
     * @async
     *
     * @param userID {String} user id
     * @param callback {Function} (err, result)
     *
     * @returns {Promise}
     */
    getSubscriptions(userID, callback) {
        return new Promise(resolve => resolve())
            // check permission
            .then(() => new Promise((resolve, reject) => {
                if(!this.getUser().isAllowed("user.profile.information"))
                    return reject([ErrorCodes.operationNotAllowed, "user.profile.information"]);

                if(this.getUser().isMe(userID) && !this.getUser().isAllowed("user.subscribe.account"))
                    return reject([ErrorCodes.operationNotAllowed, "user.subscribe.account"]);

                if(!this.getUser().isMe(userID) && !this.getUser().isAllowed("user.subscriptions.other.information"))
                    return reject([ErrorCodes.operationNotAllowed, "user.subscriptions.other.information"]);

                return resolve();
            }))

            .then(() => new Promise((resolve, reject) => this.getUserService().getActiveUserByID(userID, (err, user) => (err || !user) ? reject(err) : resolve(user.profile.subscribedUsers) )))

            .then(subscribedUsers => new Promise((resolve, reject) => this.getProfile(subscribedUsers, (err, profiles) => {
                if(err)
                    return reject(err);

                return resolve(profiles);
            })))

            // success or failure
            .then(subscriptions => callback(null, { subscriptions }))
            .catch(args => callback(args, null))
    }

    /**
     * Get public profile of any user
     *
     * @method getProfile
     * @async
     *
     * @param userIDs {String|Array} user profile ids (multiple fetching of profiles possible)
     * @param callback {Function} (err, result)
     *
     * @returns {Promise}
     */
    getProfile(userIDs, callback) {
        userIDs = _.castArray(userIDs);

        // filter out invalid user ids
        userIDs = userIDs.filter(userID => Mongoose.Types.ObjectId.isValid(userID));

        return new Promise(resolve => resolve())
            // check permission
            .then(() => new Promise((resolve, reject) => {
                if(!this.getUser().isAllowed("user.profile.information"))
                    return reject([ErrorCodes.operationNotAllowed, "user.profile.information"]);

                return resolve();
            }))

            // get users
            .then(() => new Promise((resolve, reject) =>
                UserModel.find({
                    _id: { $in: userIDs },
                    active: true
                }, (err, users) => {
                    if(err)
                        return reject([err]);

                    return resolve(users);
                })))

            // prepare profile data
            .then(users => Promise.all(
                users.map(user => new Promise(resolve => {
                    let profileData = {
                        id: user.id,
                        name: user.name,
                        isMe: user.id == this.getUser().id,
                        displayName: user.profile.displayName,
                        birthday: user.profile.birthday,
                        description: user.profile.description,
                        location: user.profile.location,
                        socialLinks: user.profile.socialLinks,
                        playedGames: user.profile.playedGames
                    };

                    if(this.getUser().isAllowed("user.profile.extendedInformation")) {
                        profileData = Object.assign(profileData, {
                            lastKnownRemoteAddresses: user.lastKnownRemoteAddresses
                        });
                    }

                    resolve(profileData);
                }))
            ))

            // success or failure
            .then(profileData => callback(null, profileData))
            .catch(args => callback(args, null))
    }

    /**
     * User subscribe or unsubscribe logic
     *
     * @method subscribeOrUnsubscribe
     * @async
     *
     * @param userID {String} user id to subscribe / unsubscribe
     * @param unsubscribe {Boolean} subscribe or unsubscribe user
     * @param callback {Function} (err, success)
     *
     * @returns {Promise}
     */
    subscribeOrUnsubscribe(userID, unsubscribe, callback) {
        return new Promise(resolve => resolve())
            // check permission
            .then(() => new Promise((resolve, reject) => {
                if(!this.getUser().isAllowed("user.subscribe.account"))
                    reject([ErrorCodes.operationNotAllowed, "user.subscribe.account"]);

                return resolve();
            }))

            // validate user id
            .then(() => new Promise((resolve, reject) => Mongoose.Types.ObjectId.isValid(userID) ? resolve() : reject([ErrorCodes.invalidObjectID, userID])))

            .then(() => Promise.all([
                // get requestee user
                new Promise((resolve, reject) =>
                    UserModel.findById(this.getUser().id, (err, requesteeUser) => err ? reject([err]) : resolve({ requesteeUser }))),

                // get target user
                new Promise((resolve, reject) =>
                    this.getUserService().getActiveUserByID(userID, (err, targetUser) => err ? reject(err) : resolve({ targetUser })))
            ]))

            // subscribe or unsubscribe userID
            .then(result => new Promise((resolve, reject) => {
                // we need to glue both promises together
                result = result.reduce((acc, res) => Object.assign(acc, res), {});

                // requestee user cant subscribe / unsubscribe it self
                if(this.getUser().isMe(result.targetUser.id))
                    reject([unsubscribe ? ErrorCodes.userCantUnsubscribeItSelf : ErrorCodes.userCantSubscribeItSelf ]);

                if(unsubscribe)
                    result.requesteeUser.profile.subscribedUsers = _.filter(result.requesteeUser.profile.subscribedUsers, subscribeUserID => subscribeUserID !== userID);
                else if(!result.requesteeUser.profile.subscribedUsers.includes(userID))
                    result.requesteeUser.profile.subscribedUsers.push(userID);

                result.requesteeUser.set({
                    profile: {
                        subscribedUsers: result.requesteeUser.profile.subscribedUsers
                    }
                });

                result.requesteeUser.save((err, user) => err ? reject([err]) : resolve(user));
            }))

            // success or failure
            .then(user => callback(null, { subscribedUsers: user.profile.subscribedUsers }))
            .catch(args => callback(args, null))
    }
}
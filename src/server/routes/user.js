/**
 * user.js
 *
 * All user API routes are defined here.
 *
 *
 * @namespace server.routes
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-10
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import jwt from 'jwt-simple';
import ConfigServer from './../../../config/server';

import UserModel from '../models/user'
import UserGroupModel from '../models/userGroup'

import { ErrorCodes, errorResponse } from '../helper/errorResponse'
import { successResponse } from '../helper/successResponse'

/**
 * API Routes for users
 *
 * GitHub issue: https://github.com/geforcefan/keystone/issues/3
 *
 * @class User
 */
export default class User {
    constructor(router) {
        router.post('/authenticate', this.postAuthenticate.bind(this));
        router.post('/register', this.postRegister.bind(this));
        router.post('/create', this.postCreate.bind(this));
        router.post('/update/:userID', this.postUpdate.bind(this));
    }


    /**
     * Create user route
     *
     * @method postUpdate
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    postCreate(req, res) {
        try {
            new Promise(resolve => resolve())
                .then(() => new Promise((resolve, reject) =>
                    req.user.isAllowed("user.create.account") ? resolve() : reject([ErrorCodes.operationNotAllowed, "user.create.account"])))
                .then(() => (['a', 'b']).reduce((promise, field) => {
                    promise.then(userData => new Promise((resolve, reject) => {
                        userData[field] = "hey";
                        return resolve(userData);
                    }));
                }, new Promise(resolve => resolve({}))))
                .then(result => console.log(result));
        } catch(e) {
            console.log(e);
        }
            /*
            .then(() => new Promise((resolve, reject) =>
                (['name', 'email', 'password', 'groupID', 'profile']).reduce((promise, field) => {
                    if(req.body[field]) {
                        if (!req.user.isAllowed(`user.set.other.${field}`))
                            return reject([ErrorCodes.operationNotAllowed, `user.set.other.${field}`]);
                        userData[field] = req.body[field];
                    }

                    return resolve(userData);
                }), new Promise()))
            .then(result => res.send(successResponse({ fine: "ok" })))
            .catch(args => res.send(errorResponse.apply(this, args)));*/
    }

    /**
     * Update user route
     *
     * @method postUpdate
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    postUpdate(req, res) {
        let userID = req.params.userID;

        // check permissions first
        (['name', 'email', 'password', 'groupID', 'profile']).reduce((promise, field) =>
            promise.then((userChanges) => new Promise((resolve, reject) => {
                if(req.body[field]) {
                    if(req.user.isMe(userID) && !req.user.isAllowed(`user.set.own.${field}`))
                        return reject([ErrorCodes.operationNotAllowed, `user.set.own.${field}`]);

                    if(!req.user.isMe(userID) && !req.user.isAllowed(`user.set.other.${field}`))
                        return reject([ErrorCodes.operationNotAllowed, `user.set.other.${field}`]);

                    if(field === "password") {
                        return UserModel.generatePasswordHash(req.body[field], (hash) => {
                            userChanges[field] = hash;
                            return resolve(userChanges);
                        }, (err) => resolve(userChanges))
                    } else {
                        userChanges[field] = req.body[field];
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
                else if(result.sourceGroup.level <= req.user.getGroup().level && !req.user.isMe(userID))
                    reject([ErrorCodes.userModifyCantModifyUserWithLessEqualLevelThanMe]);

                // we also can´t assign a group with less or equal level than our level
                else if(result.userChanges.groupID && result.targetGroup.level <= req.user.getGroup().level)
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
            .then(user => res.send(successResponse({ userID: userID })))
            .catch(args => res.send(errorResponse.apply(this, args)));
    }


    /**
     * Registration route
     *
     * @method postRegister
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    postRegister(req, res) {
        if(!req.body.name || !req.body.email || !req.body.password) {
            res.send(errorResponse(ErrorCodes.registrationFillAllFields))
        } else {
            new Promise(resolve => resolve())
                .then(result => new Promise(resolve => UserGroupModel.findOne({ name: "user" }, (err, group) => resolve(group))))
                .then(group => new Promise((resolve, reject) => new UserModel({
                    name: req.body.name,
                    password: req.body.password,
                    email: req.body.email,
                    groupID: group.id
                }).save((err, user) => err ? reject(err) : resolve(user))))
                .then(user => res.send(successResponse({ id: user.id })))
                .catch(err => res.send(errorResponse(ErrorCodes.registrationUsernameOrEmailExists)));
        }
    }

    /**
     * Authentication route (in other words, login attempt)
     *
     * @method postAuthenticate
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    postAuthenticate(req, res) {
        new Promise(resolve => resolve())
            .then(result => new Promise((resolve, reject) => UserModel.findOne({ name: req.body.name }, (err, user) => (err || !user ? reject(ErrorCodes.authenticationUserNotFound) : resolve(user)))))
            .then(user => new Promise((resolve, reject) => user.comparePassword(req.body.password, (err, isMatch) => {
                if(isMatch && !err) {
                    let token = jwt.encode(user, ConfigServer.auth.secret);
                    resolve(token);
                } else {
                    reject(ErrorCodes.authenticationWrongPassword);
                }
            })))
            .then(token => res.send(successResponse({ token: `JWT ${token}` })))
            .catch(err => res.send(errorResponse(err)));
    }
}
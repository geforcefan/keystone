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

import { errorResponse } from '../helper/errorResponse'
import { successResponse } from '../helper/successResponse'

import { Router, RouteMethods } from '../helper/router';

import _ from 'lodash'

/**
 * API Routes for users
 *
 * GitHub issue: https://github.com/geforcefan/keystone/issues/3
 *
 * @class User
 * @extends server.helper.Router
 */
export default class User extends Router {
    constructor() {
        super();

        this.addRoute('/authenticate', this.authenticate.bind(this), RouteMethods.post);
        this.addRoute('/register', this.register.bind(this), RouteMethods.post);

        this.addRoute('/modify/:userID', this.modify.bind(this), RouteMethods.post);

        this.addRoute('/profile/:userID', this.getProfile.bind(this), RouteMethods.get);
        this.addRoute('/subscriptions/:userID', this.getSubscriptions.bind(this), RouteMethods.get);

        this.addRoute('/subscribe/:userID', this.subscribe.bind(this), RouteMethods.get);
        this.addRoute('/unsubscribe/:userID', this.unsubscribe.bind(this), RouteMethods.get);

        this.addRoute('/block/:userID', this.block.bind(this), RouteMethods.get);
        this.addRoute('/unblock/:userID', this.unblock.bind(this), RouteMethods.get);
    }

    /**
     * Get user profile
     *
     *      /profile/:userID
     *
     * @method getProfile
     *
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id
     * @param res {Object} Response provided by express
     */
    getProfile(req, res) {
        this.getUserProfileService().getProfile(req.params.userID, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, _.castArray(err)));
            else {
                let profileData = _.first(result);
                res.send(successResponse(profileData ? profileData : null));
            }
        });
    }

    /**
     * Get subscriptions of a user
     *
     * @method getSubscriptions
     *
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id
     * @param res {Object} Response provided by express
     */
    getSubscriptions(req, res) {
        this.getUserProfileService().getSubscriptions(req.params.userID, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, _.castArray(err)));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Subscribe a user
     *
     *      /subscribe/:userID
     *
     * @method subscribe
     *
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id to subscribe
     * @param res {Object} Response provided by express
     */
    subscribe(req, res) {
        this.getUserProfileService().subscribeOrUnsubscribe(req.params.userID, false, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, _.castArray(err)));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Unsubscribe a user
     *
     *      /unsubscribe/:userID
     *
     * @method unsubscribe
     *
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id to unsubscribe
     * @param res {Object} Response provided by express
     *
     */
    unsubscribe(req, res) {
        this.getUserProfileService().subscribeOrUnsubscribe(req.params.userID, true, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, _.castArray(err)));
            else
                res.send(successResponse(result));
        });
    }


    /**
     * Get subscriptions of a user
     *
     * @method getSubscriptions
     *
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id
     * @param res {Object} Response provided by express
     */
    getSubscriptions(req, res) {
        this.getUserProfileService().getSubscriptions(req.params.userID, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, _.castArray(err)));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Block a user
     *
     *      /block/:userID
     *
     * @method block
     *
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id to block
     * @param res {Object} Response provided by express
     */
    block(req, res) {
        this.getUserService().setBlockStateOfUser(req.params.userID, true, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, _.castArray(err)));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Unblock a user
     *
     *      /unblock/:userID
     *
     * @method unblock
     *
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id to unblock
     * @param res {Object} Response provided by express
     *
     */
    unblock(req, res) {
        this.getUserService().setBlockStateOfUser(req.params.userID, false, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, _.castArray(err)));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Modify user route
     *
     *      /modify/:userID
     *
     * @method update
     *
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} id of the user which should be modified
     * @param res {Object} Response provided by express
     */
    modify(req, res) {
        this.getUserService().modify(req.params.userID, req.body, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, _.castArray(err)));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Registration route
     *
     *      /register
     *
     * @method register
     *
     * @param req {Object} Request provided by express
     * @param req.body.name {String} user name
     * @param req.body.password {String} user password
     * @param req.body.email {String} email address
     * @param res {Object} Response provided by express
     */
    register(req, res) {
        this.getUserService().register(req.body, (err, result) =>
            err ? res.send(errorResponse.apply(this, _.castArray(err))) : res.send(successResponse(result)));
    }

    /**
     * Authentication route (in other words, login attempt)
     *
     *      /authenticate
     *
     * @method authenticate
     *
     * @param req {Object} Request provided by express
     * @param req.body.name {String} user name
     * @param req.body.password {String} user password
     * @param res {Object} Response provided by express
     */
    authenticate(req, res) {
        this.getUserService().authenticate(req.body, (err, result) =>
            err ? res.send(errorResponse.apply(this, _.castArray(err))) : res.send(successResponse(result)));
    }
}
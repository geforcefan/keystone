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

import { errorResponse } from '../helper/response/errorResponse'
import { successResponse } from '../helper/response/successResponse'

import { Router, RouteMethods } from '../helper/misc/router';

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
        this.addRoute('/requestActivation', this.requestActivation.bind(this), RouteMethods.post);
        this.addRoute('/activate', this.activate.bind(this), RouteMethods.post);

        this.addRoute('/modify/:userID', this.modify.bind(this), RouteMethods.post);

        this.addRoute('/profile/:userID', this.getProfile.bind(this), RouteMethods.get);
        this.addRoute('/subscriptions/:userID', this.getSubscriptions.bind(this), RouteMethods.get);

        this.addRoute('/subscribe/:userID', this.subscribe.bind(this), RouteMethods.get);
        this.addRoute('/unsubscribe/:userID', this.unsubscribe.bind(this), RouteMethods.get);
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
     * Request activation route
     *
     *      /requestActivation
     *
     * @method requestActivation
     *
     * @param req {Object} Request provided by express
     * @param req.body.email {String} email address
     * @param res {Object} Response provided by express
     */
    requestActivation(req, res) {
        this.getUserService().generateAndSendActivationCode(req.body.email, (err, result) =>
            err ? res.send(errorResponse.apply(this, _.castArray(err))) : res.send(successResponse(result)));
    }

    /**
     * Activate account route
     *
     *      /activate
     *
     * @method activate
     *
     * @param req {Object} Request provided by express
     * @param req.body.code {String} code provided via email
     * @param req.body.token {String} activation token provided via email
     * @param res {Object} Response provided by express
     */
    activate(req, res) {
        this.getUserService().activateAccount(req.body.code, req.body.token, (err, result) =>
            err ? res.send(errorResponse.apply(this, _.castArray(err))) : res.send(successResponse(result)));
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
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

        this.addRoute('/me', this.getMe.bind(this), RouteMethods.get);
        this.addRoute('/profile/:userID', this.getProfile.bind(this), RouteMethods.get);

        this.addRoute('/follow/:userID', this.follow.bind(this), RouteMethods.get);
        this.addRoute('/unfollow/:userID', this.unfollow.bind(this), RouteMethods.get);
    }

    /**
     * Get user profile
     *
     * @method getProfile
     * @private
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id
     * @param res {Object} Response provided by express
     */
    getProfile(req, res) {
        this.getUserService().getProfile(req.params.userID, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, err));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Follow a user
     *
     * @method follow
     * @private
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id to follow
     * @param res {Object} Response provided by express
     */
    follow(req, res) {
        this.getUserService().followOrUnfollow(req.params.userID, false, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, err));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Unfollow a user
     *
     * @method unfollow
     * @private
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} user id to unfollow
     * @param res {Object} Response provided by express
     *
     */
    unfollow(req, res) {
        this.getUserService().followOrUnfollow(req.params.userID, true, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, err));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Get own user information
     *
     * @method getMe
     * @private
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    getMe(req, res) {
        Promise.all([
            new Promise(resolve => resolve({
                isAuth: req.user.isAuth()
            })),
            new Promise(resolve => resolve({
                user: _.pick(req.user.toObject(), ['name', 'email'])
            })),
            new Promise(resolve => resolve({
                permissions: req.user.getPermissions()
            })),
            new Promise(resolve => this.getUserService().getProfile(req.user.id, (err, profile) => resolve({
                profile
            })))
        ]).then(result =>
            res.send(successResponse(result.reduce((acc, res) => Object.assign(acc, res))))
        );
    }

    /**
     * Modify user route
     *
     * @method update
     * @private
     * @param req {Object} Request provided by express
     * @param req.params.userID {String} id of the user which should be modified
     * @param res {Object} Response provided by express
     */
    modify(req, res) {
        this.getUserService().modify(req.params.userID, req.body, (err, result) => {
            if(err)
                res.send(errorResponse.apply(this, err));
            else
                res.send(successResponse(result));
        });
    }

    /**
     * Registration route
     *
     * @method register
     * @private
     * @param req {Object} Request provided by express
     * @param req.body.name {String} user name
     * @param req.body.password {String} user password
     * @param req.body.email {String} email address
     * @param res {Object} Response provided by express
     */
    register(req, res) {
        this.getUserService().register(req.body, (err, result) =>
            err ? res.send(errorResponse.apply(this, err)) : res.send(successResponse(result)));
    }

    /**
     * Authentication route (in other words, login attempt)
     *
     * @method authenticate
     * @private
     * @param req {Object} Request provided by express
     * @param req.body.name {String} user name
     * @param req.body.password {String} user password
     * @param res {Object} Response provided by express
     */
    authenticate(req, res) {
        this.getUserService().authenticate(req.body, (err, result) =>
            err ? res.send(errorResponse.apply(this, err)) : res.send(successResponse(result)));
    }
}
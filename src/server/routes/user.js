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

import { Router, RouteMethods } from '../helper/router';
import UserService from '../services/user'

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

        this.addRoute('/authenticate', this.postAuthenticate.bind(this), RouteMethods.post);
        this.addRoute('/register', this.postRegister.bind(this), RouteMethods.post);
        this.addRoute('/modify/:userID', this.postModify.bind(this), RouteMethods.post);
        this.addRoute('/me', this.getMe.bind(this), RouteMethods.get);
    }

    /**
     * Get own user information
     *
     * @method isAuthenticated
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    getMe(req, res) {
        res.send(successResponse({
            isAuth: req.user.isAuth(),
            user: _.pick(req.user.toObject(), ['name', 'email']),
            permissions: req.user.getPermissions()
        }));
    }

    /**
     * Modify user route
     *
     * @method postUpdate
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    postModify(req, res) {
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
     * @method postRegister
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    postRegister(req, res) {
        this.getUserService().register(req.body, (err, result) =>
            err ? res.send(errorResponse.apply(this, err)) : res.send(successResponse(result)));
    }

    /**
     * Authentication route (in other words, login attempt)
     *
     * @method postAuthenticate
     * @param req {Object} Request provided by express
     * @param res {Object} Response provided by express
     */
    postAuthenticate(req, res) {
        this.getUserService().authenticate(req.body, (err, result) =>
            err ? res.send(errorResponse.apply(this, err)) : res.send(successResponse(result)));
    }
}
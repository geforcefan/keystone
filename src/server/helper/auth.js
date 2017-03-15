/**
 * auth.js
 *
 * Authentication helper. Includes a little auth strategy for passport,
 * provides two helper methods for initialization and authentication
 * which is called during the bootstrap of the server. Nothing special here.
 *
 *
 * @class auth
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-09
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import UserModel from './../models/user';
import ServerConfig from './../../../config/server'

/**
 * initializes the auth strategy and provides helper functions
 *
 * @method export default
 * @return {Object} initialize and authentication functions
 */
export default function() {
    var opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeader(),
        secretOrKey: ServerConfig.auth.secret
    };

    passport.use(new Strategy(opts, (jwtPayload, done) => {
        UserModel.findOne({
            id: jwtPayload.id,
            password: jwtPayload.password,
            blocked: false,
            active: true
        }, (err, user) => {
            if (err) {
                return done(null, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));

    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function(cb) {
            return passport.authenticate("jwt", ServerConfig.auth.session, cb);
        }
    }
}
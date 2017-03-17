/**
 * user.js
 *
 * User model
 *
 *
 * @namespace server.models
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-10
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Mongoose from '../helper/mongoose';
import bcrypt from 'bcrypt';

import UserGroupModel from './userGroup'
import allPermissions from './../helper/permissions';

import _ from 'lodash'
import UserProfileSchema from './userProfile'

/**
 * User model
 *
 * GitHub issue: https://github.com/geforcefan/keystone/issues/2
 *
 * @class UserSchema
 * @extends Mongoose.Schema
 */
export class UserSchema extends Mongoose.Schema {
    constructor() {
        super({
            /**
             * Username
             *
             * @attribute name
             * @required
             * @type String
             */
            name: {
                type: String,
                unique: true,
                required: true
            },

            /**
             * Password
             *
             * @attribute password
             * @required
             * @type String
             */
            password: {
                type: String,
                required: true
            },

            /**
             * eMail Address
             *
             * @attribute email
             * @required
             * @type String
             */
            email: {
                type: String,
                unique: true,
                required: true
            },

            /**
             * {{#crossLink "server.models.UserGroupSchema"}}Group{{/crossLink}} id
             *
             * @attribute groupID
             * @required
             * @type String
             */
            groupID: {
                type: String,
                required: true
            },

            /**
             * Creation date of the user
             *
             * @attribute creationDate
             * @type Date
             * @required
             * @default Date.now
             */
            creationDate: {
                type: Date,
                required: true,
                default: Date.now
            },

            /**
             * User active. After registration, user has to be activated
             *
             * @attribute active
             * @type Boolean
             * @default false
             */
            active: {
                type: Boolean,
                default: false
            },

            /**
             * User blocked. This will block users account
             *
             * @attribute blocked
             * @type Boolean
             * @default false
             */
            blocked: {
                type: Boolean,
                default: false
            },

            /**
             * User profile
             *
             * @attribute profile
             * @type server.models.UserProfileSchema
             * @default UserProfileSchema
             */
            profile: {
                type: new UserProfileSchema(),
                default: new UserProfileSchema()
            }
        });

        this.pre('save', this.preSave);
        this.pre('update', this.preSave);

        this.methods.comparePassword = this.comparePassword;
        this.methods.cacheGroupAndPermissions = this.cacheGroupAndPermissions;
        this.methods.setAuth = this.setAuth;
        this.methods.isAllowed = this.isAllowed;
        this.methods.isAuth = this.isAuth;
        this.methods.isMe = this.isMe;

        this.methods.getGroup = this.getGroup;
        this.methods.getPermissions = this.getPermissions;

        this.statics.generatePasswordHash = this.generatePasswordHash;
    };

    /**
     * Generate a password hash
     * A little work around for the query hook middleware problem
     * https://github.com/saintedlama/passport-local-mongoose/issues/135
     *
     * @method generatePasswordHash
     * @static
     * @async
     * @param password {String} password
     * @param resolve {Function} resolve callback with the hash
     * @param reject {Function} reject callback
     */
    generatePasswordHash(password, resolve, reject) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err)
                return reject(err);
            bcrypt.hash(password, salt, (err, hash) => {
                if (err)
                    return reject(err);

                resolve(hash);
            })
        });
    }

    /**
     * Pre save hook which bcrypts the password before its saved to the database
     *
     * @method preSave
     * @private
     * @async
     * @param next {Function} success callback
     * @return {*}
     */
    preSave(next) {
        if (this.isModified('password') || this.isNew) {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    return next(err);
                }
                bcrypt.hash(this.password, salt, (err, hash) => {
                    if (err) {
                        return next(err);
                    }
                    this.password = hash;
                    next();
                });
            });
        } else {
            return next();
        }
    };

    /**
     * Compare any password with the users password
     *
     * @method comparePassword
     * @async
     * @param password {String} password
     * @param next {Function} success callback
     */
    comparePassword(password, next) {
        bcrypt.compare(password, this.password, function (err, isMatch) {
            if (err) {
                return next(err);
            }
            next(null, isMatch);
        });

    };

    /**
     * A simple check whether the userID matches with the self user
     *
     * @param userID {String} user id to be compared
     * @method isMe
     * @return {Boolean}
     */
    isMe(userID) {
        return userID == this.id;
    }

    /**
     * To use {{#crossLink "server.models.UserSchema/isAllowed:method"}} isAllowed {{/crossLink}} method properly,
     * the user group and permissions needs to be cached
     *
     * @method cacheGroupAndPermissions
     * @async
     * @param next {Function} next callback
     * @param abort {Function} abort callback
     */
    cacheGroupAndPermissions(next, abort) {
        new Promise((resolve) => resolve())
        // get the group of the user
            .then(result => new Promise(resolve => UserGroupModel.findById(this.groupID, (err, group) => resolve(group))))
            .then(group => new Promise(resolve => {
                if (typeof this.groupID === "undefined" || !this.groupID)
                // fallback to guest when no groupID was provided
                    return UserGroupModel.findOne({name: "guest"}, (err, group) => resolve(group));
                else if (!group)
                // fallback to user when group is just not found but provided
                    return UserGroupModel.findOne({name: "user"}, (err, group) => resolve(group));
                // group found, just take that
                else resolve(group);
            }))
            .then(group => {
                if (!group)
                    return new Promise((resolve, reject) => reject(true));

                // assign group to the user model (makes life easy)
                this.group = group;

                // if the group has all permissions, we can grab all
                // permissions from the definitions (definitions/permissions.js)
                if (group.permissions.hasAllPermissions) {
                    this.permissions = allPermissions;

                    return new Promise((resolve, reject) => reject(false));
                } else {
                    // in this case, the group has not all the permissions and we need to grab them
                    // from the group
                    return new Promise(resolve => {
                        // find all groups with a greater level than the main group level
                        UserGroupModel.find({
                            level: {$gt: group.level}
                        }, (err, groups) => resolve([group].concat(groups)));
                    });
                }
            })
            .then(groups => {
                this.permissions = groups
                    .map(group => group.permissions.allowedTo)
                    .reduce((acc, group) => _.union(acc, group), []);

                return next();
            })
            .catch(hasError => {
                if (hasError) {
                    abort("Something is completely wrong. No group is found. " +
                        "Maybe there is an inconsistency in the Database, because none of the " +
                        "fallback groups are found (guest, user).");
                } else
                    next();
            });
    }

    /**
     * Check the user permission
     *
     * @method isAllowed
     * @param permission {String} permission to be checked
     * @return {Boolean}
     */
    isAllowed(permission) {
        return _.includes(this.permissions, permission);
    }

    /**
     * Set "is user authenticated"
     *
     * @method setAuth
     * @param auth {Boolean} is user authenticated
     */
    setAuth(auth) {
        this.auth = auth;
    }

    /**
     * Is user authenticated
     *
     * @method isAuth
     * @return {Boolean}
     */
    isAuth() {
        return this.auth;
    }

    /**
     * Get users group. Returns only the group when
     * {{#crossLink "server.models.UserSchema/cacheGroupAndPermissions:method"}}cacheGroupAndPermissions{{/crossLink}}
     * is called before
     *
     * @method getGroup
     * @returns {UserGroupSchema}
     */
    getGroup() {
        return this.group;
    }

    /**
     * Get user permissions. Returns only the permissions when
     * {{#crossLink "server.models.UserSchema/cacheGroupAndPermissions:method"}}cacheGroupAndPermissions{{/crossLink}}
     * is called before
     *
     * @method getPermissions
     * @returns [...]
     */
    getPermissions() {
        return this.permissions;
    }
}

/**
 * Cached user permissions.
 * Will filled after calling UserSchema.cachePermissions
 *
 * @property permissions
 * @default []
 * @private
 * @type {Array}
 */
UserSchema.permissions = [];

/**
 * User authentication state. This is mostly used for the injected user model
 * in the request
 *
 * @property auth
 * @default false
 * @private
 * @type {boolean}
 */
UserSchema.auth = false;

/**
 * User group
 *
 * @property group
 * @default null
 * @private
 * @type {UserGroupSchema}
 */
UserSchema.group = null;

export default Mongoose.model('User', new UserSchema());
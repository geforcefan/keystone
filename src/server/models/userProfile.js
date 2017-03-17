/**
 * userProfile.js
 *
 * User profile model
 *
 *
 * @namespace server.models
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-17
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import Mongoose from '../helper/mongoose';

import SocialLinksModel from './socialLinks'
import UserModel from './user'

import _ from 'lodash'

/**
 * User profile model
 *
 * GitHub issue: https://github.com/geforcefan/keystone/issues/2
 *
 * @class UserProfileSchema
 */
export default class UserProfileSchema extends Mongoose.Schema {
    constructor() {
        super({
            /**
             * Display name (alias name, etc.)
             *
             * @attribute displayName
             * @optional
             * @type String
             * @default ""
             */
            displayName: {
                type: String,
                default: ""
            },

            /**
             * User birthday
             *
             * @attribute birthday
             * @optional
             * @type Date
             * @default null
             */
            birthday: {
                type: Date,
                default: null
            },

            /**
             * User description, biography
             *
             * @attribute description
             * @optional
             * @type String
             * @default ""
             */
            description: {
                type: String,
                default: ""
            },

            /**
             * User location
             *
             * @attribute location
             * @optional
             * @type String
             * @default ""
             */
            location: {
                type: String,
                default: ""
            },

            /**
             * Users social links (youtube, twitch, steam, etc.)
             *
             * @attribute socialLinks
             * @optional
             * @type [SocialLinksModel]
             * @default []
             */
            socialLinks: {
                type: [ new SocialLinksModel() ],
                default: []
            },

            /**
             * Users played games.
             *
             *      ['NoLimitsCoaster', 'NoLimitsCoaster2', "RollerCoasterTycoon1", "RollerCoasterTycoon2", "RollerCoasterTycoon3", "PlanetCoaster"]
             *
             * @attribute playedGames
             * @optional
             * @type [String]
             * @default []
             */
            playedGames: {
                type: [String],
                enum: ['NoLimitsCoaster', 'NoLimitsCoaster2', "RollerCoasterTycoon1", "RollerCoasterTycoon2", "RollerCoasterTycoon3", "PlanetCoaster"],
                default: []
            },

            /**
             * Users following user
             *
             * @attribute followingUsers
             * @optional
             * @type [String]
             * @default []
             */
            followingUsers: {
                type: [String],
                default: []
            }
        });

        this.pre('save', this.preSave);
    }

    /**
     * Pre save hook, validation of
     * {{#crossLink "server.models.UserProfileSchema:followingUsers/attribute"}}followingUsers{{/crossLink}}
     *
     * @method preSave
     * @private
     * @async
     * @param next {Function} next callback
     */
    preSave(next) {
        // check the "following" user ids for their existence
        if(this.isModified("followingUsers") || this.isNew) {
            this.followingUsers = _.filter(this.followingUsers, v => Mongoose.Types.ObjectId.isValid(v));

            UserModel.find({
                _id: { $in: this.followingUsers }
            }, (err, users) => {
                this.followingUsers = _.map(users, user => user._id);

                next();
            });
        } else
            next();
    }
}
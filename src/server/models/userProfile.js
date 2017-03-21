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
 * @extends Mongoose.Schema
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
             * @type [server.models.SocialLinksSchema]
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
             * User subscriptions.
             *
             * @attribute subscribedUsers
             * @optional
             * @type [ObjectId]
             * @default []
             */
            subscribedUsers: {
                type: [String],
                default: []
            }
        });
    }
}
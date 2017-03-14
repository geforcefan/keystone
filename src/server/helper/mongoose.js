/**
 * mongoose.js
 *
 * Mongoose helper. This is only a wrapper which is ONLY needed because of this
 * Promise deprecation stuff (https://github.com/Automattic/mongoose/issues/4291).
 * Mongooses default Promises "mpromise" is deprecated, so we have to plugin
 * the ES6 Promises (mongoose.Promise = global.Promise). But: we need to do this every time
 * we import 'mongoose'. I don´t want to write this every single time when I am a using mongoose.
 * So when you want to use mongoose, import THIS module.
 *
 *
 * @class mongoose
 * @namespace server.helper
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-12
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

export {
    mongoose as default,
    mongoose,
    Schema,
};
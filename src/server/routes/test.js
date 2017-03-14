/**
 * test.js
 *
 * Just for testing
 *
 *
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-10
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import NoLimitsUserUploadModel from '../models/noLimitsUserUpload'
import UserUploadModel from '../models/userUpload'

export default class Test {
    constructor(router) {
        router.get('/test', this.getTest.bind(this));
    }

    getTest(req, res) {
        new NoLimitsUserUploadModel({
            name: "heyho",
            mediaID: "sd",
            userID: "ui",
            testField: "hello"
        }).save((err, upload) => {
            UserUploadModel.find({
                type: "NoLimits"
            }, (err, up) => {

                res.send({
                    "up": up,
                    "isAuth": req.user.isAuth(),
                    "user.set": req.user.isAllowed("user.set"),
                    "user.delete": req.user.isAllowed("user.delete"),
                    "test.permission3": req.user.isAllowed("test.permission3"),
                    "test.permission4": req.user.isAllowed("test.permission4")
                });
            });


        });
    }
}
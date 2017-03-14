import Mongoose from '../helper/mongoose';
import UserUploadModel from './userUpload';

class NoLimitsUserUpload extends Mongoose.Schema {
    constructor() {
        super({
            testField: {
                type: String
            }
        }, {
            discriminatorKey: "type"
        });
    };
}

export default UserUploadModel.discriminator('NoLimits', new NoLimitsUserUpload());

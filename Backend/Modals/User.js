const mongoose = require('mongoose')
const validator = require('validator')

const UserSchema = new mongoose.Schema(
    {
        firstname:
        {
            type:String,
            required:true,
            maxlength:30,
        },
        lastname:
        {
            type:String,
            required:true,
            maxlength:50
        },
        ContactNumber:{
             type:String,
             required:true,
             unique:true,
             validate(value)
             {
                if(!validator.isMobilePhone(value))
                    {
                        throw new Error('Contact Number not valid')
                    }
             }
        },
        gender:
        {
            type:String,
            required:true,
            validate(value)
            {
                const temp = ['male','female','others'];
                if(!temp.includes(value))
                    {
                        throw new Error('Invalid Gender');
                    }
            }
        }
    },{timestamps:true})

User = mongoose.model('User',UserSchema)
module.exports = User;
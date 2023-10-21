const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_verified: {
        type: Number,
        default: 0
    },
    isBlocked:{
        type: Boolean,
        default:false,
    },
        
    cart:[{
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
        },
        quantity:{
            type : Number,
            default: 1
        },
        productPrice:{
            type: Number,
            required : true
        },
        // discountPrice:{
        //     type : Number,
        //     required : true
        // }
    }],
    wallet:{
        type : Number,
        default : 0
    },
    walletHistory : [{
        date : {
            type : Date,
        },
        amount : {
            type : Number
        },
        message : {
            type : String
        }
    }],
    wishlist:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],
    
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);

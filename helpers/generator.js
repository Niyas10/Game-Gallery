const bcrypt = require('bcrypt')
const User = require('../models/userModel')


const getOTP = () =>  Math.floor( 1000000*Math.random() )

const securePassword = async(password) => {
    try {
        const hashedPassword = await bcrypt.hash(password,10);
        return hashedPassword;
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getOTP,
    securePassword
}
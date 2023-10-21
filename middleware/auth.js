
const User = require('../models/userModel')


const isUserLoggedIn = (req, res, next) => {
    try {
console.log(req.session.userId);
        if(!req.session.userId){
            return res.redirect('/login')
        }
        next();

    } catch (error) {
        console.log(error);
    }
}

const isUserLoggedOut = async(req, res, next) => {
    try {

        if(req.session.userId){
            return res.redirect('/home')
        }
        next();

    } catch (error) {
        console.log(error);
    }
}

const isUserBlocked = async(req, res, next) => {
    try {

        if(req.session.userId){
            const userData = await User.findById({_id : req.session.userId})
            
            let isUserBlocked = userData.isBlocked
            if(isUserBlocked){
                req.session.destroy()
                req.app.locals.message = 'You are blocked by admin';
                return res.redirect('/login')
            }
        }
        next();

    } catch (error) {
        console.log(error);
    }
}


const isAdminLoggedIn = (req, res, next) => {
    try {
        
        if(!req.session.admin){
            return res.redirect('/admin/login')
        }

        next();

    } catch (error) {

        console.log(error);
    }
}

const isAdminLoggedOut = async(req, res, next) => {
    try {

        if(req.session.admin){
            return res.redirect('/admin/dashboard')
        }
        next();

    } catch (error) {
        console.log(error);
    }
}









module.exports = {
    isUserLoggedIn,
    isAdminLoggedIn,
    isUserBlocked,
    isUserLoggedOut,
    isAdminLoggedOut
}
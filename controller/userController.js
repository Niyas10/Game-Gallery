const User=require('../models/userModel')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const Addresses = require('../models/addressModel')
const { getOTP, securePassword } = require('../helpers/generator')
const Products = require('../models/productModel')
require('dotenv').config()

// loadHome


const loadHome = async(req,res)=>{
    try{
        const isLoggedIn = Boolean(req.session.userId)
        res.render('index',{ isLoggedIn })
        
    }
    catch(error){
        console.log(error)
    }
}

 // signup


 const getSignUp = async(req,res)=>{
    try{
        res.render('login-register')
    }
    catch (error){
        console.log(error)
    }
    
 }


// load login 

const loadLogin = async(req,res)=>{
  try{
    res.render('login-regiter')
  }
  catch(error){
    console.log(error)
  }
}


//  postsignup

const postSignup = async (req, res) => {
    try {
      const { username,userEmail,userNumber, password,confirmPassword} = req.body;
  
      if(username){

        if (password == confirmPassword) {
          const userData = await User.findOne({ email:userEmail });
          if (userData) {
            console.log("User already exists");
            return res.render("signUp", { message: "User already exists" });
          }
          const OTP = req.session.OTP = getOTP();
          console.log(OTP);
          req.session.save();
          req.session.username = username;
          req.session.email = userEmail;
          req.session.mobile = userNumber;
          req.session.password = password;
          console.log(username,userEmail);
          sendVerifyMail(username, userEmail, OTP);
          res.render("otp", {
            title: "Verification Page",
            username,
            email:userEmail,
            mobile:userNumber,
            password,
            message: "Please check your email",
          });
        } else {
          console.log("Password not matching");
          res.render("signup", { message: "Passwords not matching" });
        }
      }else{
        res.render('login-register',{message:'please provide username'})
      }
    } catch (error) {
      console.log(error.message);
    }
  };

// Collect Deatiles

  const sendVerifyMail = async (username, email, OTP) => {
   
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "prosgaming157@gmail.com",
          pass: process.env.PASSWORD,
        },
      });


      const mailOptions = {
        from: "prosgaming157@gmail.com",
        to: email,
        subject: "For Verification of Mail",
        html: `<h1>  ${username}!!! Look at ME! </h1> <h5>Your OTP for verification is,</h5> <p>OTP:${OTP}</p>`,
      };
    
      transporter.sendMail(mailOptions, function (error, info) {
      
        if (error) {
          console.log(error+'             hy');
        } else {
          console.log("Email has been sent:- ", info.response);
        }
      });
    } catch (error) {
      console.log('hy bye faizu ');
      console.log(error.message);
      
    }
  };


 

// const otpVerificaton = async(req,res)=>{
//     try{
//         res.render('otp')
//     }
//     catch(error){
//         console.log(error)
//     }
// }


const postVerifyOtp = async (req, res) => {
  try {
    const enteredOtp = Number(req.body.otp);
    const sharedOtp = Number(req.session.OTP);
    const {username ,email,mobile, password } = req.session;
    console.log(sharedOtp);
    console.log(enteredOtp);
    if (enteredOtp === sharedOtp) {
      console.log(typeof enteredOtp, typeof sharedOtp);
      const secPassword = await securePassword(password);
      const currDate=new Date()
      const day = String(currDate.getDate()).padStart(2, '0');
const month = String(currDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
const year = currDate.getFullYear();

const formattedDate = `${day}-${month}-${year}`;


      const user = new User({
        name:username,
        email:email,
        mobile:mobile,
        password:secPassword,
        // dob:formattedDate,
      });

      const newUserData = await user.save();
      req.session.userId = newUserData._id;
      res.redirect("/home");
    } else {
      console.log("Incorrect OTP");
      res.render("otp", { username ,email,mobile, password});
    }
  } catch (error) {
    console.log(error);
  }
};



// postLogin

const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
  
    if (userData) {
      // req.session.userId = userData;
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        // console.log('password matched');
        if (!userData.isBlocked) {
          req.session.userId = userData._id;
          req.session.cartCount = userData.cart.length
          req.session.wishCount = userData.wishlist.length

          res.render("index",{isLoggedIn:true});
        } else {
          console.log("Sorry, You are blocked by the admin");
          res.render("login-register", {
            message: "Sorry, You are blocked by the admin",
          });
          return;
        }
      } else {
        console.log("Invalid Password");
        res.render("login-register", { message: "Invalid Password" });
      }
    } else {
      console.log('user not exist');
      res.render("login-register", { message: "User does not exist" });
    }
  } catch (error) {
    console.log(error);
  }
};




// logout


const userLogout = async (req, res) => {
  try {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/home");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};


  // userTab

  const userTab = async (req, res) => {
    try {
      // const searchQuery=req.query.searchQuery || ''
        const userData = await User.find();
        // {fname:{$regex: '^'+ searchQuery,$options:'i'}}
        
        res.render("users", { userData: userData, page:'users'});
    } catch (error) {
      console.log(error);
    }
  };


  // userProfile

//   const loadProfile = async(req, res, next) => {
//     try {
//         console.log('loaded profile');
//         const userId = req.session.userId;
//         const userData = await User.findById({_id: userId})
//         const userAddress = await Addresses.findOne({userId:userId})

//         res.render('userProfile',{ userData, userAddress,isLoggedIn:true,page:'Profile'})
//     } catch (error) {
//         next(error);
//     }
// }



const forgetPassword = async(req,res)=>{
  try{
     
      res.render('forgetPassword') 
  }
  catch(error){
      console.log(error)
  }
}


// userProfile

const loadProfile = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        console.log(userId,'userId');
        
        if(!userId){
          return res.redirect('/signup')
        }
        const userData = await User.findById({_id: userId})
        const userAddress = await Addresses.findOne({userId:userId})
       

        res.render('userProfile',{ user:userData,userAddress,isLoggedIn:true,page:'Profile'})
    } catch (error) {
        next(error);
    }
}

// editProfile


const loadEditProfile = async(req, res, next) => {
  try {
      id = req.session.userId;
      const userData = await User.findById({_id:id})
      res.render('editProfile',{user:userData})
  } catch (error) {
      next(error); 
  }
}


// postedit
const postEditProfile = async(req, res, next) => {
  try {
      const userId = req.session.userId;
      const { name, mobile} = req.body
      await User.findByIdAndUpdate(
          { _id: userId },
          {
              $set:{
                  name, mobile
              }
          }
      );

      res.redirect('/profile');

  } catch (error) {
      next(error);
  }
}


// change password

const changePassword= async(req,res)=>{
  try{
      // const isLoggedIn = Boolean(req.session.userId)
      res.render('changePassword')
      
  }
  catch(error){
      console.log(error)
  }
}

// post password 

const postChangePassword = async(req, res, next) => {
  try {
     

      const userId = req.session.userId;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if(newPassword !== confirmPassword){
          return res.redirect('/profile/changePassword')
      }

      const userData = await User.findById({ _id: userId });

      const passwordMatch = await bcrypt.compare(oldPassword, userData.password);
      if(passwordMatch){
          const sPassword = await securePassword(newPassword)
          await User.findByIdAndUpdate(
              { _id: userId },
              {
                  $set:{
                      password:sPassword
                  }
              }
          );
          return res.redirect('/profile');
      }else{
          return res.redirect('/profile/changePassword');
      }
  } catch (error) {
      next(error);
  }
}

const addToCart = async(req, res, next) => {
  try {
      const pdtId = req.params.id;
      const userId = req.session.userId;

      const userData = await User.findById({_id:userId})
      const pdtData = await Products.findById({_id: pdtId})
      
      if(pdtData.quantity){
    
          const isproductExist = userData.cart.findIndex((pdt) => pdt.productId == pdtId)
          if(isproductExist === -1){


              const cartItem = {
                  productId : pdtId,
                  quantity : 1,
                  productPrice : pdtData.price,
                  
              }
      
              await User.findByIdAndUpdate(
                  {_id: userId},
                  {
                      $push:{
                          cart: cartItem
                      }
                  }
              )
  
              req.session.cartCount++;

          }else{
                  
              await User.updateOne(
                  {_id: userId, 'cart.productId' : pdtId},
                  {
                      $inc:{
                          "cart.$.quantity":1
                      }
                  }
              );
  
              console.log('Product already exist on cart, quantity incremeted by 1');
          }

      }

      res.redirect('/shoppingCart')

  } catch (error) {
      next(error);
  }
}


const updateCart = async(req,res,next)=>{
  try {
      const userId = req.session.userId;
      const quantity = parseInt(req.body.amt)
      const prodId = req.body.prodId

      const pdtData = await Products.findById({_id:prodId})

      const stock = pdtData.quantity
      if(pdtData.offerPrice){

        totalSingle = quantity*pdtData.price;

    }else{

        totalSingle = quantity*pdtData.price;
    }
        
     
    
      if(stock >= quantity){
          await User.updateOne(
              {_id:userId, 'cart.productId' :prodId},
              {
                 $set:{
                     'cart.$.quantity' : quantity
                 }
              }
          )

          const userData = await User.findById({_id:userId}).populate('cart.productId');
            let totalPrice  =0;
            let totalDiscount=0;

           let cartItems = userData.cart

            for(let i=0;i<cartItems.length;i++){

                totalPrice += cartItems[i].productId.price*cartItems[i].quantity;                                         
                if(cartItems[i].productId.offerPrice){
             totalDiscount += (cartItems[i].productId.price - cartItems[i].productId.offerPrice)*cartItems[i].quantity;
          
            }else{
                totalDiscount += 0
            }
            }
 
            res.json({
                status:true,
                data:{totalPrice,totalSingle,totalDiscount}
            })
        }else{
            res.json({status:false,
                data:'producut stock has been exceeded'})
        }
        
    } catch(error){
        next(error)
    }
}


const removeCartItem = async(req,res,next)=>{
  try {
      
      const pdtId = req.params.id;
      const userId = req.session.userId;

      const userData = await User.findOneAndUpdate(
          {_id:userId, 'cart.productId':pdtId},
          {
              $pull:{
                  cart:{
                      productId:pdtId
                  }
              }
          }
      );

      req.session.cartCount--;

      res.redirect('/shoppingCart')
  } catch (error) {
      console.log(error.message);
  }
}


// wishlist




const loadWishlist = async(req, res, next) => {
  try {
      console.log('loading wishlist');
      const userId = req.session.userId
      if(!userId){
        return res.redirect('/signup')
      }
      const isLoggedIn = Boolean(req.session.userId)
      const userData = await User.findById({_id:userId}).populate('wishlist')
      const wishlist = userData.wishlist
      res.render('wishlist',{page:'Wishlist', parentPage:'Shop', isLoggedIn, wishlist})
  } catch (error) {
      next(error)
  }
}


// add wishlist


const addToWishlist = async(req, res, next) => {
  try {

      const { productId } = req.params
      const { userId } = req.session
      const userData = await User.findById({_id: userId});
      console.log('okda');
      if(!userData.wishlist.includes(productId)){
        console.log(productId);
          userData.wishlist.push(productId)
          await userData.save()
          req.session.wishCount++
      }
      console.log('bye da ');
      // let { returnPage } = req.query
      // if(returnPage == 'shop'){
          res.redirect('/shop')
      // }else if(returnPage == 'productOverview'){
          // res.redirect(`/shop/productOverview/${productId}`)
      // }
  } catch (error) {
      next(error)
  }
}



const removeWishlistItem = async(req, res, next) => {
  try {
      const { productId } = req.params
      const { userId } = req.session
      await User.findByIdAndUpdate(
          {_id: userId},
          {
              $pull:{
                  wishlist: productId
              }
          }
      );
      req.session.wishCount--
      const { returnPage } = req.query
      if(returnPage == 'shop'){
          res.redirect('/shop')
      }else if(returnPage == 'productOverview'){
          res.redirect(`/shop/productOverview/${productId}`)
      }else if(returnPage == 'wishlist'){
          res.redirect('/wishlist')
      }
  } catch (error) {
      next(error)
  }
}


// wallet page loading



const loadWalletHistory = async(req, res, next) => {
  try {
      const userId = req.session.userId;
      const userData = await User.findById({_id: userId})
      const walletHistory = userData.walletHistory.reverse()
      res.render('walletHistory',{isLoggedIn:true, userData,walletHistory, page:'Profile'})
  } catch (error) {
      next(error)
  }
}

const addMoneyToWallet = async(req, res, next) => {
  try {
      console.log('adding money to wallet');
      const { amount } = req.body
      const  id = crypto.randomBytes(8).toString('hex')

      var options = {
          amount: amount*100,
          currency:'INR',
          receipt: "hello"+id
      }

      instance.orders.create(options, (err, order) => {
          if(err){
              res.json({status: false})
          }else{
              res.json({ status: true, payment:order })
          }

      })
  } catch (error) {
      next(error)
  }
}




module.exports ={

    loadHome,
    getSignUp,
    loadLogin,
    postSignup,
    sendVerifyMail,
    postVerifyOtp,
    postLogin,
    userLogout,
    userTab,
    forgetPassword ,
    loadProfile,
    loadEditProfile,
    postEditProfile,
    changePassword,
    postChangePassword,
    addToCart,
    removeCartItem ,
    updateCart ,
    loadWishlist,
    addToWishlist ,
    removeWishlistItem,
    loadWalletHistory,
    addMoneyToWallet
  
} 
const Products = require('../models/productModel')
const Category = require('../models/categoryModel')
const Offers = require('../models/offerModel')
const fs = require('fs')
const path = require('path')
const User = require('../models/userModel')




const loadProduct = async( req, res, next) => {
    try {
        const pdtsData = await Products.find().populate("category").populate('offer')

        const offerData = await Offers.find({ $or: [
            {status : 'Starting Soon'},
            {status : 'Available' }
        ]});
        res.render('products',{pdtsData, offerData, page:'Products'})
    } catch (error) {
        next(error);
    }
}

const loadAddProduct = async( req, res, next) => {
    try {
        const categories = await Category.find({ isListed: true })
        res.render('addProduct',{categories, page:'Products'})
    } catch (error) {
                next(error);
    }
}

const addProductDetails = async( req, res, next ) => {
    try {
        const { 
            brand, productName, category,
            quantity, price,  description,
        } = req.body
 

     

        let images = []
        for(let file of req.files){
            images.push(file.filename)
        }


        const catData = await Category.find({name: category});
        
        const prodData = await new Products({
            brand, name:productName, description, category : catData[0]._id,
             price, quantity , images, createdAt : new Date()
        }).save();
        
         res.redirect('/admin/products')
    } catch (error) {
                next(error);
    }
}

const loadEditProduct = async(req, res ,next) => {
    try {
        const id = req.params.id;
        const pdtData = await Products.findById({_id:id}).populate('category')
        // console.log(pdtData);
        const catData = await Category.find({ isListed: true })
       

        res.render('editProduct',{pdtData, catData, page: 'Products'})

    } catch (error) {
        next(error);
    }
}

const deleteProduct = async( req, res, next) => {
    try {
        const id = req.params.id;
        const prodData = await Products.findById({_id:id})
        prodData.isListed = !prodData.isListed
        prodData.save()
        
        res.redirect('/admin/products');
    } catch (error) {
                next(error);
    }
}


const postEditProduct = async(req, res, next) => {
    try {
        const { 
            id, productName, category,
          
            quantity, price, dprice, description,
        } = req.body

        const brand = req.body.brand.toUpperCase()

      

        if (req.files) {
            let newImages = []
            for (let file of req.files) {
                newImages.push(file.filename)
            }
            
            await Products.findOneAndUpdate({ _id: id }, { $push: { images: { $each: newImages } } })
        }

     
        const catData = await Category.findOne({ name: category })
     
        await Products.findByIdAndUpdate(
            { _id: id },
            {
                $set:{
                    brand, name:productName, category:catData._id, quantity,
                    description, price
                }
            }
        )

        res.redirect('/admin/products')

    } catch (error) {
                next(error);
    }
}


const loadShop = async(req,res, next) => {
    try {

        const isLoggedIn = Boolean(req.session.userId);

        let page = 1;
        if(req.query.page){
            page = req.query.page
        }

        let limit = 9;

        //declaring a default min and max price
        let minPrice = 1;
        let maxPrice = Number.MAX_VALUE;

        //changing min and max prices to filter by price
        if(req.query.minPrice && parseInt(req.query.minPrice)){
            minPrice =  parseInt(req.query.minPrice);
        }
        if(req.query.maxPrice && parseInt(req.query.maxPrice)){
            maxPrice =  parseInt(req.query.maxPrice);
        }


        let search = '';
        if(req.query.search){
            search = req.query.search
        }

        //finding all categories that matches the search query
        async function getCategoryIds(search){
            const categories = await Category.find(
                {
                    name:{
                        $regex: '.*' +search+'.*',
                        $options: 'i'
                    }
                }
            );
            return categories.map(category => category._id)
        }



        //Declaring a common query object to find products
        const query = {
            isListed: true,
            $or: [
                {
                    name:{
                        $regex: '.*' + search + '.*',
                        $options: 'i'
                    }
                },
                {
                    brand:{
                        $regex: '.*' + search + '.*',
                        $options: 'i'
                    }
                }
            ],
            price: {
                $gte: minPrice,
                $lte: maxPrice
            }
        }

        if(req.query.search){
            search = req.query.search;
            query.$or.push({
                'category' : {
                    $in: await getCategoryIds(search)
                }
            });
        };

        //add category to query to filter based on category
        if(req.query.category){
            query.category = req.query.category
        };

        //add category to query to filter based on brand
        if(req.query.brand){
            query.brand = req.query.brand
        };

        let sortValue = 1;
        if(req.query.sortValue){
            sortValue = req.query.sortValue;
        }


        let pdtsData;
        if(sortValue == 1){
            pdtsData = await Products.find(query).populate('category').populate('offer').sort({ createdAt: -1 }).limit(limit*1).skip( (page - 1)*limit );

        }else{

            pdtsData = await Products.find(query).populate('category').populate('offer')

            pdtsData.forEach(((pdt) => {
                if (pdt.offerPrice) {
                    pdt.actualPrice = pdt.offerPrice
                    
                } else {
                    pdt.actualPrice = pdt.price - pdt.discountPrice
                }
            }))

            if(sortValue == 2){
                //sorting ascending order of actualPrice
                pdtsData.sort( (a,b) => {
                    return a.price - b.price;
                });

            }else if(sortValue == 3){

                //sorting descending order of actualPrice
                pdtsData.sort( (a,b) => {
                    return b.price - a.price;
                });

            }

            pdtsData = pdtsData.slice((page - 1) * limit, page * limit);

        }

        const categoryNames = await Category.find({})
        const brands = await Products.aggregate([{
                $group: {
                    _id: '$brand'
                }
        }]);

        let totalProductsCount = await Products.find(query).count()
        let pageCount = Math.ceil(totalProductsCount / limit)

        let removeFilter = 'false'
        if(req.query && !req.query.page){
            removeFilter = 'true'
        };

        let userData;
        let wishlist;
        let cart;
        if(req.session.userId){
            userData = await User.findById({_id:req.session.userId})
            wishlist = userData.wishlist;
            cart = userData.cart.map(item => item.productId.toString())
        }
       

        res.render('shop',{
            pdtsData,
            userId: req.session.userId,
            categoryNames,
            brands,
            pageCount,
            currentPage: page,
            sortValue,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            category: req.query.category,
            brand: req.query.brand,
            removeFilter,
            search: req.query.search,
            wishlist,
            cart,
            isLoggedIn,
            page:'Shop'
        });

    } catch (error) {
                next(error);
    }
}



const loadProductOverview = async(req,res, next) => {
    try {
        const id = req.params.id;
        console.log(id,'hey');
        const userId = req.session.userId
        const isLoggedIn = Boolean(userId)
        const pdtData = await Products.findById({_id:id}).populate('category')
     

        let isPdtExistInCart = false;
        let isPdtAWish = false;
        let isUserReviewed = false;
        if(userId){
            const userData = await User.findById({_id:userId})
            const wishlist = userData.wishlist;
            // if(wishlist.find((productId) => productId == id )){
            //     isPdtAWish = true;
            // }

            // userData.cart.forEach((pdt) => {
            //     if(pdt.productId == id){
            //         isPdtExistInCart = true
            //     }
            // })

            // pdtData.reviews.forEach((review) => {
            //     if(review.userId._id == userId){
            //         isUserReviewed = true;
            //     }
            // });
        }

        let currPrice = 0;
        if(pdtData.offer){
            currPrice = pdtData.offerPrice
        }else{
            currPrice = pdtData.price - pdtData.discountPrice
        }

        const discountPercentage = Math.floor( 100 - ( (currPrice*100) / pdtData.price ) )

        res.render('productOverview',{
            pdtData, parentPage : 'Shop', 
            page: 'Product Overview',isLoggedIn, 
            isPdtAWish, isPdtExistInCart, 
            isUserReviewed, currPrice, discountPercentage
        });


    } catch (error) {
                next(error);
    }
}



const loadShoppingCart = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        // if(!userId){
        //     return res.redirect('/signup')
        //   }
        // console.log(userId+'aaa');
        
        const userData = await User.findById({_id:userId}).populate('cart.productId').populate('cart.productId.offer')
        const cartItems = userData.cart
        // console.log(cartItems+'aaaa');
        // console.log(userData+'ssss');
        //Code to update cart values if product price changed by admin after we added pdt into cart
        for(const { productId } of cartItems ){
            await User.updateOne(
                { _id: userId, 'cart.productId': productId._id },
                {
                    $set: {
                        'cart.$.productPrice': productId.price,
                        'cart.$.discountPrice': productId.discountPrice
                    }
                }
            )
        }

        res.render('shoppingCart',{page: 'Shopping Cart', parentPage: 'Shop', isLoggedIn: true, userData, cartItems})
    } catch (error) {
        next(error); 
    }
}


const applyProductOffer = async(req, res, next) => {
    try {
        const { offerId, productId } = req.body
        
        

        const product = await Products.findById({_id:productId})
       
        const offerData = await Offers.findById({_id:offerId})
        const actualPrice = product.price;
       
        let offerPrice = 0;
        if(offerData.status == 'Available'){
            offerPrice = Math.round( actualPrice - ( (actualPrice*offerData.discount)/100 ))
           
        }

       const Pdt  = await Products.findByIdAndUpdate(
            {_id:productId},
            {
                $set:{
                    offerPrice,
                    offerType: 'Offers',
                    offer: offerId,
                    offerAppliedBy: 'Product'
                }
            }
        )
  

        res.redirect('/admin/products')

    } catch (error) {
        next(error)
    }
}

const removeProductOffer = async(req, res, next) => {
    try {
        const { productId } = req.params
        await Products.findByIdAndUpdate(
            {_id: productId},
            {
                $unset:{
                    offer:'',
                    offerType: '',
                    offerPrice:'',
                    offerAppliedBy:''
                }
            }
        );

        res.redirect('/admin/products')

    } catch (error) {
        next(error)
    }
}


module.exports = {

      loadProduct,
      loadAddProduct,
      addProductDetails,
      loadEditProduct,
      deleteProduct,
      postEditProduct,
      loadShop,
      loadProductOverview ,
      loadShoppingCart,
      removeProductOffer,
      applyProductOffer 
     
}













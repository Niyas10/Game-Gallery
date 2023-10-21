const Category = require('../models/categoryModel')
const Products = require('../models/productModel')
const Offers = require('../models/offerModel')





const loadCategories = async(req, res, next) => {
    try {
      
        const categories = await Category.find({})
        const offerData = await Offers.find({ $or: [
            {status : 'Starting Soon'},
            {status : 'Available' }
        ]});
      

        res.render('categories',{categories, page:'Categories', offerData})
    } catch (error) {
      
        next(error);
    }
}



const addCategory = async(req, res, next) => {
    try {
      
        const categoryName = req.body.categoryName.toUpperCase()
        if(categoryName){

            const isExistCategory = await Category.findOne({name:categoryName});

            if(isExistCategory){
                console.log('Category Already Exists');
                req.app.locals.specialContext = 'Category already exists';
                res.redirect('/admin/category');
                
            }else{
                await new Category({name : categoryName}).save()
                req.app.locals.specialContext = 'Category added successfully';
                res.redirect('/admin/category');
            }

        }else{
           
            res.redirect('/admin/category');
        }

    } catch (error) {
                next(error.message);
    }
}


const editCategory = async(req, res, next) => {
    try {
     
        const id = req.body.categoryId
        const newName = req.body.categoryName.toUpperCase()

        const isCategoryExist = await Category.findOne({name:newName})

        if(req.file){
            const image = req.file.filename
            if(!isCategoryExist || isCategoryExist._id == id){
                await Category.findByIdAndUpdate({_id:id},{ $set :{ name: newName, image:image } })
            }
        }else{
            if(!isCategoryExist){
                await Category.findByIdAndUpdate({_id:id},{ $set :{ name: newName } })
            }
        }

        res.redirect('/admin/category')
    } catch (error) {
                next(error);
    }
}

const listCategory = async(req,res, next) => {
    try {
        const id = req.params.id;
        const categoryData = await Category.findById({_id:id})

        if(categoryData){
            categoryData.isListed = !categoryData.isListed
            await categoryData.save()
        }
        res.redirect('/admin/category')

    } catch (error) {
                next(error);
    }
}
const applyCategoryOffer = async(req, res, next) => {
    try {

        const { offerId, categoryId, override } = req.body

        //Setting offerId to offer field of category
        await Category.findByIdAndUpdate(
            {_id:categoryId},
            {
                $set:{
                    offer: offerId
                }
            }
        );

        const offerData = await Offers.findById({_id:offerId})
        const products = await Products.find({category: categoryId})

        //applying offer to every product in the same category
        for(const pdt of products){

            const actualPrice = pdt.price // - pdt.discountPrice;
            
            let offerPrice = 0;
            if(offerData.status == 'Available'){
                offerPrice = Math.round( actualPrice - ( (actualPrice*offerData.discount)/100 ))
            }
    
            if(override){
                await Products.updateOne(
                    { _id: pdt._id },
                    {
                        $set:{
                            offerPrice,
                            offerType: 'Offers',
                            offer: offerId,
                            offerAppliedBy: 'Category'
                        }
                    }
                );
            }else{
                await Products.updateOne(
                    {
                        _id: pdt._id,
                        offer: { $exists: false }
                    },
                    {
                        $set:{
                            offerPrice,
                            offerType: 'Offers',
                            offer: offerId,
                            offerAppliedBy: 'Category'
                        }
                    }
                );
            }

        }

        res.redirect('/admin/category')

    } catch (error) {
        next(error)
    }
}


const removeCategoryOffer = async(req, res, next) => {
    try {
        const { catId } = req.params

        await Category.findByIdAndUpdate(
            {_id:catId},
            {
                $unset: {
                    offer:''
                }
            }
        );

        //Unsetting every prodects that matches catId
        await Products.updateMany(
            {
                category: catId,
                offerAppliedBy: 'Category'
            },
            {
                $unset:{
                    offer:'',
                    offerType: '',
                    offerPrice:'',
                    offerAppliedBy:''
                }
            }
        );
        
        res.redirect('/admin/category')

    } catch (error) {
        next(error)
    }
}




module.exports = {
    loadCategories,
    addCategory,
    editCategory,
    listCategory,
    removeCategoryOffer ,
    applyCategoryOffer 
}
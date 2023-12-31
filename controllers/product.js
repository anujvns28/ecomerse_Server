const Cateogry = require("../models/cateogry");
const SubCategory = require("../models/subCategory");
const Product = require("../models/product");
const User = require("../models/user");
const { uploadImageToCloudinary } = require("../utilit/imageUploader");
const { promises } = require("nodemailer/lib/xoauth2");
const product = require("../models/product");


exports.createProduct = async (req, res) => {
    try {
        //fetching data productName
        const { productName, desc, price, subCategory, userId, categoryId, forWhom, color } = req.body;
        let productImages = []
        console.log(req.files, 'this is form creating products')



        const mainImage = req.files.mainImage;
        const image1 = req.files.img1;
        const image2 = req.files.img2;
        const image3 = req.files.img3;
        const image4 = req.files.img4;
        const image5 = req.files.img5;

        if (!image1 || !image2 || !image3 || !image4 || !image5) {
            return res.status(500).json({
                success: false,
                message: "all images are required"
            })
        } else {
            productImages.push(image1)
            productImages.push(image2)
            productImages.push(image3)
            productImages.push(image4)
            productImages.push(image5)
        }



        //validation
        if (!productName || !desc || !price || !subCategory || !userId || !categoryId || !forWhom || !color) {
            return res.status(500).json({
                success: false,
                message: "all filds are required"
            })
        }
        //check category is vallid or not
        const subcategorDetail = await SubCategory.findOne({ _id: subCategory });
        if (!subcategorDetail) {
            return res.status(500).json({
                success: false,
                message: "this is not vallied Subcategory "
            })
        }


        //check category is vallid or not
        const categorDetail = await Cateogry.findOne({ _id: categoryId });
        if (!categorDetail) {
            return res.status(500).json({
                success: false,
                message: "this is not vallied category "
            })
        }
        //vallidation for user
        const isUserExist = await User.findById(userId);
        if (!isUserExist) {
            return res.status(500).json({
                success: false,
                message: "this is not vallied user "
            })
        }

        const uploader = async (productImg) => await uploadImageToCloudinary(productImg, process.env.FOLDER_NAME);
        const uploader2 = await uploadImageToCloudinary(mainImage, process.env.FOLDER_NAME)

        let proImages = []
        productImages.map(async (productImg) => {
            const img = uploader(productImg)
            img.then(async function (result) {
                proImages.push(result.secure_url)
                if (productImages.length === proImages.length) {
                    createProduct()
                }
            })
        })

        console.log(proImages, "this is images ji")

        const createProduct = async () => {
            const newProduct = await Product.create({
                productName: productName,
                productDes: desc,
                price: price,
                productsImages: proImages,
                user: userId,
                subCategory: subCategory,
                category: categoryId,
                mainImage: uploader2.secure_url,
                forWhom: forWhom,
                color: color
            })

            // pushing productid in seller user scehma
            console.log("this is new produft id", newProduct._id)
            const userDetails = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        products: newProduct._id
                    }
                },
                { new: true }
            )

            await SubCategory.findByIdAndUpdate(
                subCategory,
                {
                    $push: {
                        product: newProduct._id
                    }
                },
                { new: true }
            )

            return res.status(200).json({
                success: true,
                message: "product created successfully",
                data: newProduct
            })
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in creating products"
        })
    }
}


//edit product
exports.editProduct = async (req, res) => {
    try {
        //fetching data
        const { productName, productDes, price, productId, forWhom, subCategory, color } = req.body;
        let productImages = []
        let thumnail = null


        let mainImg = req.body.mainImage
        mainImg === undefined ? mainImg = req.files.mainImage : req.body.mainImage

        console.log(mainImg, "this is main img")

        let image1 = req.body.img1
        image1 === undefined ? image1 = req.files.img1 : req.body.img1
        productImages.push(image1);

        let image2 = req.body.img2
        image2 === undefined ? image2 = req.files.img2 : req.body.img2
        productImages.push(image2);

        let image3 = req.body.img3
        image3 === undefined ? image3 = req.files.img3 : req.body.img3
        productImages.push(image3);

        let image4 = req.body.img4
        image4 === undefined ? image4 = req.files.img4 : req.body.img4
        productImages.push(image4);

        let image5 = req.body.img5
        image5 === undefined ? image5 = req.files.img5 : req.body.img5
        productImages.push(image5);

        console.log(req.body, "this is array ji")



        //validation
        if (!productName || !productDes || !price || !productId || !productDes || !forWhom || !subCategory) {
            return res.status(500).json({
                success: false,
                message: "all filds are required"
            })
        }

        //validation
        const productDetails = await Product.findOne({ _id: productId });
        if (!productDetails) {
            return res.status(500).json({
                success: false,
                message: "this is not vallid product"
            })
        }
        console.log(typeof (mainImg))
        if (typeof (mainImg) != 'string') {
            console.log("calling main img function")
            let img = await uploadImageToCloudinary(mainImg);
            console.log(img.secure_url, "this is urlllll")
            thumnail = img.secure_url
        }


        const uploader = async (productImg) => await uploadImageToCloudinary(productImg, process.env.FOLDER_NAME);






        const updateProduct = async () => {
            console.log("calling updat function")
            const product = await Product.findByIdAndUpdate(
                productId,
                {
                    productName: productName,
                    productDes: productDes,
                    price: price,
                    forWhom: forWhom,
                    color: color,
                    productsImages: proImages,
                    mainImage: thumnail === null ? mainImg : thumnail
                },
                { new: true }
            )

            return res.status(200).json({
                success: true,
                message: "product updated successfully",
                data: product
            })

        }

        let proImages = []
        productImages.map(async (productImg) => {
            if (typeof (productImg) != "string") {
                const img = uploader(productImg)
                img.then(async function (result) {
                    proImages.push(result.secure_url)
                    if (productImages.length === proImages.length) {
                        updateProduct()
                    }
                })

            } else {
                proImages.push(productImg)
                if (productImages.length === proImages.length) {
                    updateProduct()
                }
            }
        })





    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in editing products"
        })
    }
}


// deleting product
exports.deleteProduct = async (req, res) => {
    try {
        const { productId, userId } = req.body

        if (!productId || !userId) {
            return res.status(500).json({
                success: false,
                message: "all filds are required"
            })
        }

        const productDetail = await Product.findOne({ _id: productId })
        console.log(productDetail)

        if (!productDetail) {
            return res.status(500).json({
                success: false,
                message: "This is not vallid Product"
            })
        }

        const userDetail = await User.findOne({ _id: userId })
        if (!userDetail) {
            return res.status(500).json({
                success: false,
                message: "This is not vallid user"
            })
        }



        await SubCategory.findByIdAndUpdate(
            productDetail.subCategory._id,
            {
                $pull: {
                    product: productId
                }
            }
        )


        await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    products: productId
                }
            },
            { new: true }
        )

        await Product.findByIdAndDelete(productId);

        return res.status(200).json({
            success: true,
            message: "product delteed successfully"
        })


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in deleting product"
        })
    }
}



// getting all products
exports.getAllProduct = async (req, res) => {
    try {
        const allProducts = await Product.find().populate("category").exec()
        console.log(allProducts)

        return res.status(200).json({
            success: true,
            message: "all product fetched successfully",
            allProducts
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in fetching all  product"
        })
    }
}

// get user product
exports.userProducts = async (req, res) => {
    try {
        //fetching data
        const { userId } = req.body;

        //vallidation
        if (!userId) {
            return res.status(500).json({
                success: false,
                message: "all fild are required"
            })
        }

        const userDetails = await User.findById(userId).populate("products").exec();

        if (!userDetails) {
            return res.status(500).json({
                success: false,
                message: "You are not vallied user "
            })
        }

        return res.status(200).json({
            success: true,
            message: "products fetched successfully",
            products: userDetails
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in fetching all  product"
        })
    }
}

// get SubCategorwiseproduct
exports.getSubCategoryWiseProduct = async (req, res) => {
    try {
        //fetchingdata
        const { subCategoryId } = req.body;
        console.log(req.body, "insucbcateogry")

        //vallidation
        if (!subCategoryId) {
            return res.status(500).json({
                success: false,
                message: "Sub Category is required"
            })
        }

        const subCategoryProducts = await SubCategory.findById(subCategoryId).populate("product")
        .populate("categoriId")
        .exec();

        if (!subCategoryProducts) {
            return res.status(500).json({
                success: false,
                message: "Sub Category is not vallid"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Product fetched successfulyy",
            subCategoryProducts
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in fetching subCategories wise product"
        })
    }
}

exports.getSingleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        console.log(req.body)

        if (!productId) {
            return res.status(500).json({
                success: false,
                message: "ProductID is required"
            })
        }

        const productDetails = await Product.findById(productId);

        if (!productDetails) {
            return res.status(500).json({
                success: false,
                message: "this is not vallied product"
            })
        }

        return res.status(200).json({
            success: true,
            message: "product Detaisl fetch successfull",
            productDetails
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in fetching single product"
        })
    }
}

// product searching api

exports.searchProduct = async (req, res) => {
    try {
        console.log(req.body)
        const { proName } = req.body;

        if (!proName) {
            return res.status(200).json({
                success: true,
                data: []
            })
        }
        console.log(proName, "this is pro name")


        const products = await Product.find(
            {
                "$or": [
                    { "productName": { $regex: proName, $options: 'i' } },
                    { "productDes": { $regex: proName, $options: 'i' } },
                ]
            }
        )

        console.log(products)

        return res.status(200).json({
            success: true,
            data: products
        })


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in Searching  product Api"
        })
    }
}

exports.getOrders = async (req, res) => {
    try {
        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "user id is required"
            })
        }

        const userData = await User.findById(userId).populate("products").exec();
        if (!userData) {
            return res.status(400).json({
                success: false,
                message: "You are not vallid user"
            })
        }

        return res.status(200).json({
            success: true,
            data: userData.products
        })


    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "error occerd in fetching order Api"
        })
    }
}



import {asyncHandler} from "../utills/asyncHandlers.js"
import {ApiError} from "../utills/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utills/cloudinary.js"
import {ApiResponse} from "../utills/ApiResponse.js"



const registerUser= asyncHandler(async (req,res)=>{

     const {userName, password, fullName,email} =req.body 

     if(userName===""){
            throw new ApiError(400, "username is required")
     }
     if(password===""){
           throw new ApiError(400, "password is required")
     }
     if(fullName===""){
           throw new ApiError(400, "fullname is required")
     }
     if(email===""){
        throw new ApiError(400, "email is required")
     }
    
    const existingUser= User.findOne({
        $or: [{userName}, {email}]
    })
  
    if(existingUser){
        throw new ApiError(409, "User already exists")
    }
   
    const avatarLocalPath= req.files?.avatar[0]?.path
    const coverImageLocalPath= req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }
    

    const user=await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        userName,
        password
    })

    const createdUser= User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while regestering the user")
    }


    return res.send(201).json(
        new ApiResponse(200, createdUser, "User regestered successfully")
    )


})






const loginUser= asyncHandler(async(req,res)=>{
    res.status(200).send("You have logged in successfully")
})

export {registerUser,loginUser}
import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema= new Schema(
    {
        userName:{
            type: String,
            require: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            require: true,
            lowercase: true,
            unique: true,
            trim: true,

        },
        fullName:{
            type: String,
            require: true,
            trim : true,
            index: true
        },
        password:{
            type: String,
            require: [true, "Password is required"]
        },
        avatar:{
            type: String,  //cloudinary url 
            require: true
        },
        coverImage:{
            type: String
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        refreshToken:{
            type: String
        }

    },
    {
        timestamps: true
    }
)

//In this section we encrypt password using bcrypt package only when password is modified.
// we used pre middleware when user saves something


userSchema.pre("save", async function(next){
   
    if(!this.isModified("password")) next()

    this.password= bcrypt.hash(this.password, 10)
    next()
})


//In this we are checking weather password is correct or not using bcrypt library.
// It returns true or false weather stored password(this.password) and entered password is correct or not

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken= async function(){
      
    jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken= async function(){
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User= mongoose.model("User",userSchema)
const passport=require('passport');
const googleStrategy=require('passport-google-oauth20').Strategy
const User=require("../models/userSchema")
const env=require('dotenv').config();
const Wallet=require("../models/walletSchema")


function generateReferralCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < length; i++) {
        referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return referralCode;
}

passport.use(new googleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'http://localhost:4000/google/callback',
},

async(accessToken,refreshToken,profile,done)=>{

    
    try {
        
        console.log("inside google async function")
        let user = await User.findOne({googleId:profile.id});
        if(user){
            return done(null,user);
        }else{

            const referralCode=generateReferralCode()
            user=new User({
                username:profile.displayName,
                email:profile.emails[0].value,
                googleId:profile.id,
                referral:referralCode,
                referralClimed:true
            })

            

            const goog=await user.save()
            const newWallet=new Wallet({
                userId:goog._id
            })
            const userWallet=await newWallet.save()
            
            
            return done(null,user)
        }


    } catch (error) {
        
        return done(error,null)
    }
}

))

passport.serializeUser((user,done)=>{

    done(null,user.id)
})

passport.deserializeUser((id,done)=>{

    User.findById(id)
    .then(user=> {
        done(null,user)
    })
    .catch(err => {
        done(err,null)
    })
})

module.exports=passport
const user = require('../../models/userSchema')
const bcrypt = require('bcrypt')


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (err) {
        console.log("err in securepasword" + err.message)
    }
}

const pageNotfound = async (req, res) => {

    try {
        res.render("page-404")
    } catch (error) {
        console.log("err in pagenot found")
        res.redirect("/pageNotfound")
    }
}




const loadHomepage = async (req, res) => {

    try {
        return res.render("home")
    } catch (error) {
        console.log("err in load Home page")
        res.status(500).send("Server error")
    }
}


const loadLogin = async (req, res) => {

    try {
        return res.render("login")
    } catch (err) {
        console.log("err in load login page " + err)
        res.status(500).send("Server error")
    }
}
const loadSignup = async (req, res) => {

    try {
        return res.render("signup")
    } catch (error) {
        console.log("err in load signup page" + error)
        res.status(500).send("Server error")
    }
}

//register new user
const signup = async (req, res) => {
    const sPassword = await securePassword(req.body.password)

    const { username, email, phone } = req.body
    try {

        const newUser = new user({
            username: username,
            email: email,
            phoneNumber: phone,
            password: sPassword
        })

        await newUser.save()
        res.send("succesfully signed")

    } catch (err) {
        console.log("err in signup page" + err)
        res.send("server error")
    }
}

// verify the user
const login = async (req, res) => {

    const { username, password } = req.body

    const userData = await user.findOne({ username: username, isActive: true })
    console.log(userData)
    if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if (passwordMatch) {
            if (userData.role === "admin") {
                return res.send("admin")
            }
            res.send("home")
        }
    } else {
        res.send("invalid usename")
    }
}



module.exports = {
    loadHomepage,
    pageNotfound,
    loadLogin,
    loadSignup,
    signup,
    login,
}
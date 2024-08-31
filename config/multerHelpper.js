
const multer=require('multer')
const path=require('path')
const fs=require('fs')

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}



const storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
},console.log("insid multer"));

const upload = multer({ storage: storage });

module.exports=upload;

// const filePath = path.join(__dirname, '../public/uploads');

// if (fs.existsSync(filePath)) {
//     console.log('File exists');
//     // You can proceed with operations on the file here
// } else {
//     console.log('File does not exist');
//     // Handle the case where the file is missing
// }
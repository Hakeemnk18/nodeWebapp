const sharp = require('sharp');
const path = require('path');
const fs = require('fs');




const processImage = async (inputPath, outputPath) => {
    try {
        await sharp(inputPath)
            .resize(300, 300)
            .toFormat('jpeg')
            .toFile(outputPath);

        
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};

module.exports={processImage};
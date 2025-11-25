const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const INPUT_DIR = 'src/assets'; // Relative path to your assets folder
const OUTPUT_DIR = 'src/resized_assets'; // New folder for resized images
const TARGET_WIDTH = 1024;
const TARGET_HEIGHT = 1536;
const IMAGE_EXTENSIONS = ['.png']; 
// ---------------------

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
    console.log(`Created output directory: ${OUTPUT_DIR}`);
}

fs.readdir(INPUT_DIR, (err, files) => {
    if (err) {
        console.error('Error reading input directory:', err);
        return;
    }

    let processedCount = 0;
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        
        // Check if the file is a supported image type
        if (IMAGE_EXTENSIONS.includes(ext)) {
            const inputPath = path.join(INPUT_DIR, file);
            const outputPath = path.join(OUTPUT_DIR, file);

            sharp(inputPath)
                .resize(TARGET_WIDTH, TARGET_HEIGHT, {
                    // Fill mode will maintain the aspect ratio and cover the size,
                    // potentially cropping parts of the image. Use 'stretch' or 'fit'
                    // if you prefer no cropping or filling the canvas respectively.
                    fit: sharp.fit.fill 
                })
                .toFile(outputPath)
                .then(() => {
                    console.log(`Successfully resized: ${file}`);
                    processedCount++;
                    if (processedCount === files.filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())).length) {
                         console.log('\n✅ All images processed successfully!');
                    }
                })
                .catch(resizeErr => {
                    console.error(`Error resizing ${file}:`, resizeErr.message);
                });
        }
    });

    if (files.filter(f => IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())).length === 0) {
        console.log('No images found in the assets folder.');
    }
});
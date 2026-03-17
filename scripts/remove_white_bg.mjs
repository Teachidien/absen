import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const PUBLIC_LOGOS_DIR = 'public/logos';
const TOLERANCE = 15; // 15% tolerance for white

async function removeWhiteBg(fileName) {
    const inputPath = path.join(PUBLIC_LOGOS_DIR, fileName);
    const outputPath = path.join(PUBLIC_LOGOS_DIR, fileName.replace('.png', '-alpha.png'));
    
    console.log(`Processing: ${fileName}`);
    try {
        const image = await Jimp.read(inputPath);
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];
            const alpha = this.bitmap.data[idx + 3];
            
            // Check if pixel is close to white
            if (red > 240 && green > 240 && blue > 240) {
                this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
            }
        });
        
        await image.write(outputPath);
        console.log(`Saved transparent image to: ${outputPath}`);
    } catch (error) {
        console.error(`Error processing ${fileName}:`, error);
    }
}

async function main() {
    const files = fs.readdirSync(PUBLIC_LOGOS_DIR).filter(f => f.endsWith('.png') && !f.endsWith('-alpha.png'));
    for (const file of files) {
        await removeWhiteBg(file);
    }
    console.log('All images processed!');
}

main();

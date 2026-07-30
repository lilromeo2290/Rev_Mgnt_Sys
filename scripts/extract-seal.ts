import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/business certificate - Copy.jpeg');
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  console.log('Image size:', imageBuffer.length, 'bytes');
  console.log('Sending to image edit API...');

  const response = await zai.images.generations.edit({
    prompt: 'Extract and isolate only the red circular district assembly seal logo on the right side of this certificate. Remove all text, background, and other elements. Keep only the circular seal emblem with its internal symbols (spear, crossed tools, waves). Make it a clean official logo on a pure white background.',
    images: [{ url: dataUrl }],
    size: '1024x1024'
  });

  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync('/home/z/my-project/public/logos/assembly-seal.png', buffer);
  console.log('Assembly seal saved to /home/z/my-project/public/logos/assembly-seal.png');
  console.log('Size:', buffer.length, 'bytes');
}

main().catch(e => { console.error(e); process.exit(1); });

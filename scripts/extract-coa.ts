import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  
  // Download the image first
  const resp = await fetch('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9094afbf9026.jpg');
  const buf = Buffer.from(await resp.arrayBuffer());
  const dataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;

  console.log('Coat of Arms image size:', buf.length, 'bytes');
  console.log('Sending to image edit API...');

  const response = await zai.images.generations.edit({
    prompt: 'Isolate and extract the Ghana Coat of Arms emblem only. Remove all background, make it a clean high-quality official Coat of Arms logo on pure white background. Keep all details: the shield with four quarters, black star on top, two eagles on sides, and FREEDOM AND JUSTICE banner at bottom.',
    images: [{ url: dataUrl }],
    size: '1024x1024'
  });

  const imageBase64 = response.data[0].base64;
  const outBuf = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync('/home/z/my-project/public/logos/ghana-coat-of-arms.png', outBuf);
  console.log('Ghana Coat of Arms saved. Size:', outBuf.length, 'bytes');
}

main().catch(e => { console.error(e); process.exit(1); });
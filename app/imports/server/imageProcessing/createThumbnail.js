import * as sharp from 'sharp';

export default async function createThumbnail(image) {
  await sharp(image)
  .resize(320, 240)
  .png()
  .toBuffer();
}

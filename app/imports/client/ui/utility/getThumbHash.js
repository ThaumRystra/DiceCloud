import * as ThumbHash from 'thumbhash';

export default async function getThumbHash(file) {
  const image = await createImageBitmap(file);
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not get context');
  const scale = 100 / Math.max(image.width, image.height)
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
  return ThumbHash.rgbaToThumbHash(pixels.width, pixels.height, pixels.data)
}

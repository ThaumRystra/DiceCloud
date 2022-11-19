function hexToRgb(hex) {
    if (!hex) return null;
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export default function isDarkColor(hexColor){
  let rgb = hexToRgb(hexColor);
  if (!rgb) return null;
  let brightness = Math.round(
    ((rgb.r* 299) + (rgb.g * 587) + (rgb.b * 114))
    / 1000
  );
  return brightness <= 125;
}

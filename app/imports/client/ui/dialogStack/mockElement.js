import { parse, stringify } from 'css-box-shadow';

// Only supports border radius defined like "20px" or "100%"
const transformedRadius = (radiusString, deltaWidth, deltaHeight) => {
  if (/^\d+\.?\d*px$/.test(radiusString)) {
    //The radius is defined in pixel units, so get the radius as a number
    const rad = +radiusString.match(/\d+\.?\d*/)[0];
    // Set the x and y radius of the "to" element, compensating for scale
    return `${rad / deltaWidth}px / ${rad / deltaHeight}px`;
  } else if (/^\d+\.?\d*%$/.test(radiusString)) {
    //The radius is defined as a percentage, so just use it as is
    return radiusString;
  }
};

const transformedBoxShadow = (shadowString, deltaWidth, deltaHeight) => {
  if (shadowString === 'none') return shadowString;
  if (shadowString[0] === 'r') {
    let strings = shadowString.match(/rgba\([^)]+\)[^,]+/g);
    strings = strings.map(string => {
      // Move color to end
      let m = string.match(/(rgba\([^)]+\))([^,]+)/);
      return `${m[2].trim()} ${m[1]}`;
    });
    shadowString = strings.join(', ');
  }
  let scaleAverage = (deltaWidth + deltaHeight) / 2;
  let shadows = parse(shadowString);
  shadows.forEach(shadow => {
    shadow.offsetX /= deltaWidth;
    shadow.offsetY /= deltaHeight;
    shadow.blurRadius /= scaleAverage;
    shadow.spreadRadius /= scaleAverage;
  })
  return stringify(shadows);
}

export default function mockElement({ source, target, offset = { x: 0, y: 0 } }) {
  if (!source || !target) throw `Can't mock without ${source ? 'target' : 'source'}`;
  let sourceRect = source.getBoundingClientRect();
  let targetRect = target.getBoundingClientRect();

  // The dialogs are transformed from their centers, so we need to find the center of each
  const sourceCenter = {
    x: sourceRect.x + sourceRect.width / 2,
    y: sourceRect.y + sourceRect.height / 2
  }
  const targetCenter = {
    x: targetRect.x + targetRect.width / 2,
    y: targetRect.y + targetRect.height / 2
  }

  // Get how must the target change to become the source
  const deltaWidth = sourceRect.width / targetRect.width;
  const deltaHeight = sourceRect.height / targetRect.height;
  const deltaLeft = sourceCenter.x - targetCenter.x + offset.x;
  const deltaTop = sourceCenter.y - targetCenter.y + offset.y;
  // Mock the source
  target.style.transform = `translate(calc(-50% + ${deltaLeft}px), calc(-50% + ${deltaTop}px)) ` +
    `scale(${deltaWidth}, ${deltaHeight})`;
  // Mock the background color unless it's completely transparent
  let backgroundColor = getComputedStyle(source).backgroundColor
  if (backgroundColor !== 'rgba(0, 0, 0, 0)') {
    target.style.backgroundColor = backgroundColor;
  }
  // Edge might not combine all border radii into a single value,
  // So we just sample the top left one if we need to
  let oldRadius = getComputedStyle(source).borderRadius ||
    getComputedStyle(source).borderTopLeftRadius;
  let borderRadius = transformedRadius(oldRadius, deltaWidth, deltaHeight);
  target.style.borderRadius = borderRadius;
  let boxShadow = transformedBoxShadow(
    getComputedStyle(source).boxShadow, deltaWidth, deltaHeight
  );
  target.style.setProperty('box-shadow', boxShadow, 'important');
}

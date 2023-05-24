/** @format */

const redWeight: number = 0.299;
const greenWeight: number = 0.587;
const blueWeight: number = 0.114;
const textColorSwitchingThreshold: number = 150;

export function pickTextColorBasedOnBgColor(bgColor: string, lightColor: string, darkColor: string) {
  var colors = bgColor.substring(4, bgColor.length - 1);
  let rgb: Array<string> = colors.split(",");
  let rgbInt: Array<number> = rgb.map((color) => parseInt(color));
  return rgbInt[0] * redWeight + rgbInt[1] * greenWeight + rgbInt[2] * blueWeight >
    textColorSwitchingThreshold
    ? darkColor
    : lightColor;
}

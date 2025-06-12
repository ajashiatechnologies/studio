export interface ColorInfo {
  name: string;
  value?: number; // For digit bands
  multiplier?: number; // For multiplier band
  tolerance?: number; // For tolerance band
  tcr?: number; // For TCR band
  hex: string;
  cssColor: string; // Actual CSS color value
}

export const RESISTOR_COLORS: Readonly<Record<string, ColorInfo>> = {
  NONE: { name: 'None', tolerance: 20, hex: '#00000000', cssColor: 'transparent' }, // Used for placeholder or missing band
  BLACK: { name: 'Black', value: 0, multiplier: 1, tcr: 250, hex: '#000000', cssColor: 'black' },
  BROWN: { name: 'Brown', value: 1, multiplier: 10, tolerance: 1, tcr: 100, hex: '#A52A2A', cssColor: 'saddlebrown' },
  RED: { name: 'Red', value: 2, multiplier: 100, tolerance: 2, tcr: 50, hex: '#FF0000', cssColor: 'red' },
  ORANGE: { name: 'Orange', value: 3, multiplier: 1000, tcr: 15, hex: '#FFA500', cssColor: 'orange' },
  YELLOW: { name: 'Yellow', value: 4, multiplier: 10000, tcr: 25, hex: '#FFFF00', cssColor: 'yellow' },
  GREEN: { name: 'Green', value: 5, multiplier: 100000, tolerance: 0.5, tcr: 20, hex: '#008000', cssColor: 'green' },
  BLUE: { name: 'Blue', value: 6, multiplier: 1000000, tolerance: 0.25, tcr: 10, hex: '#0000FF', cssColor: 'blue' },
  VIOLET: { name: 'Violet', value: 7, multiplier: 10000000, tolerance: 0.1, tcr: 5, hex: '#EE82EE', cssColor: 'violet' },
  GREY: { name: 'Grey', value: 8, multiplier: 100000000, tolerance: 0.05, tcr: 1, hex: '#808080', cssColor: 'grey' },
  WHITE: { name: 'White', value: 9, multiplier: 1000000000, hex: '#FFFFFF', cssColor: 'white' },
  GOLD: { name: 'Gold', multiplier: 0.1, tolerance: 5, hex: '#FFD700', cssColor: 'gold' },
  SILVER: { name: 'Silver', multiplier: 0.01, tolerance: 10, hex: '#C0C0C0', cssColor: 'silver' },
};

export const DIGIT_COLORS: ColorInfo[] = Object.values(RESISTOR_COLORS).filter(c => c.value !== undefined);
export const MULTIPLIER_COLORS: ColorInfo[] = Object.values(RESISTOR_COLORS).filter(c => c.multiplier !== undefined);
export const TOLERANCE_COLORS: ColorInfo[] = Object.values(RESISTOR_COLORS).filter(c => c.tolerance !== undefined);
export const TCR_COLORS: ColorInfo[] = Object.values(RESISTOR_COLORS).filter(c => c.tcr !== undefined);

export type BandType = 'digit1' | 'digit2' | 'digit3' | 'multiplier' | 'tolerance' | 'tcr';

export const getBandColors = (type: BandType): ColorInfo[] => {
  switch (type) {
    case 'digit1':
    case 'digit2':
    case 'digit3':
      return DIGIT_COLORS.filter(c => c.name !== 'Black' || type !== 'digit1'); // First band usually not black for digits
    case 'multiplier':
      return MULTIPLIER_COLORS;
    case 'tolerance':
      return TOLERANCE_COLORS;
    case 'tcr':
      return TCR_COLORS;
    default:
      return [];
  }
}

export interface CalculationResult {
  resistance: number | null;
  tolerance: number | null;
  tcr: number | null;
  resistanceString: string;
}

export function calculateResistorValues(
  numBands: 4 | 5 | 6,
  bandColors: (ColorInfo | undefined)[]
): CalculationResult {
  let resistanceValue = 0;
  let multiplierValue = 1;
  let toleranceValue: number | null = null;
  let tcrValue: number | null = null;

  if (numBands === 4) {
    const [b1, b2, b3, b4] = bandColors;
    if (b1?.value !== undefined && b2?.value !== undefined && b3?.multiplier !== undefined) {
      resistanceValue = (b1.value * 10 + b2.value) * b3.multiplier;
      if (b4?.tolerance !== undefined) toleranceValue = b4.tolerance;
    } else {
      return { resistance: null, tolerance: null, tcr: null, resistanceString: 'Invalid bands' };
    }
  } else if (numBands === 5) {
    const [b1, b2, b3, b4, b5] = bandColors;
    if (b1?.value !== undefined && b2?.value !== undefined && b3?.value !== undefined && b4?.multiplier !== undefined) {
      resistanceValue = (b1.value * 100 + b2.value * 10 + b3.value) * b4.multiplier;
      if (b5?.tolerance !== undefined) toleranceValue = b5.tolerance;
    } else {
      return { resistance: null, tolerance: null, tcr: null, resistanceString: 'Invalid bands' };
    }
  } else if (numBands === 6) {
    const [b1, b2, b3, b4, b5, b6] = bandColors;
    if (b1?.value !== undefined && b2?.value !== undefined && b3?.value !== undefined && b4?.multiplier !== undefined) {
      resistanceValue = (b1.value * 100 + b2.value * 10 + b3.value) * b4.multiplier;
      if (b5?.tolerance !== undefined) toleranceValue = b5.tolerance;
      if (b6?.tcr !== undefined) tcrValue = b6.tcr;
    } else {
      return { resistance: null, tolerance: null, tcr: null, resistanceString: 'Invalid bands' };
    }
  }

  return {
    resistance: resistanceValue,
    tolerance: toleranceValue,
    tcr: tcrValue,
    resistanceString: formatResistance(resistanceValue),
  };
}

export function formatResistance(value: number | null): string {
  if (value === null || isNaN(value) || !isFinite(value)) return '-';
  if (value === 0) return '0 Ω';

  const units = ['Ω', 'kΩ', 'MΩ', 'GΩ'];
  let i = 0;
  let res = value;

  if (res >= 1000) {
    while (res >= 1000 && i < units.length - 1) {
      res /= 1000;
      i++;
    }
  } else if (res < 1 && res > 0) {
    // For values less than 1 Ohm, we could introduce mOhms, but problem statement implies Ohms and above.
    // For now, keep it simple. If 0.5 Ohm, it will show as 0.5 Ω.
  }
  
  // Format to a reasonable number of decimal places
  let formattedValue = parseFloat(res.toPrecision(3));
  if (Number.isInteger(formattedValue)) {
    return `${formattedValue} ${units[i]}`;
  }
  return `${formattedValue} ${units[i]}`;
}


export function getColorsFromValue(resistance: number, numBands: 4 | 5 | 6): (ColorInfo | undefined)[] {
  if (isNaN(resistance) || resistance < 0) return Array(numBands).fill(undefined);

  let bands: (ColorInfo | undefined)[] = Array(numBands).fill(undefined);
  let tempResistance = resistance;
  let multiplierPower = 0;

  if (tempResistance === 0) {
    bands[0] = RESISTOR_COLORS.BLACK;
    bands[1] = RESISTOR_COLORS.BLACK;
    if (numBands >= 5) bands[2] = RESISTOR_COLORS.BLACK;
    const multiplierIdx = numBands === 4 ? 2 : 3;
    bands[multiplierIdx] = MULTIPLIER_COLORS.find(c => c.multiplier === 1); // Black or Brown (x1)
    return bands;
  }
  
  // Normalize to get multiplier
  if (tempResistance >= 1) {
    while (tempResistance >= (numBands === 4 ? 100 : 1000) && tempResistance % 10 === 0) {
        tempResistance /= 10;
        multiplierPower++;
    }
     while (tempResistance >= (numBands === 4 ? 100 : 1000) && multiplierPower < 9 ) { // Max multiplier for Giga (White)
        tempResistance /= 10;
        multiplierPower++;
    }
  } else { // tempResistance < 1
     while (tempResistance < (numBands === 4 ? 10 : 100) && multiplierPower > -2) { // Min multiplier for Silver (0.01)
        tempResistance *= 10;
        multiplierPower--;
    }
  }
  
  const finalMultiplier = Math.pow(10, multiplierPower);
  const multiplierColor = MULTIPLIER_COLORS.find(c => c.multiplier === finalMultiplier);
  
  let significantDigitsStr = Math.round(tempResistance).toString();

  if (numBands === 4) {
    if (significantDigitsStr.length > 2) significantDigitsStr = significantDigitsStr.substring(0, 2);
    else if (significantDigitsStr.length < 2) significantDigitsStr = significantDigitsStr.padStart(2, '0');
    
    bands[0] = DIGIT_COLORS.find(c => c.value === parseInt(significantDigitsStr[0]));
    bands[1] = DIGIT_COLORS.find(c => c.value === parseInt(significantDigitsStr[1]));
    bands[2] = multiplierColor;
  } else { // 5 or 6 bands
    if (significantDigitsStr.length > 3) significantDigitsStr = significantDigitsStr.substring(0, 3);
    else if (significantDigitsStr.length < 3) significantDigitsStr = significantDigitsStr.padStart(3, '0');

    bands[0] = DIGIT_COLORS.find(c => c.value === parseInt(significantDigitsStr[0]));
    bands[1] = DIGIT_COLORS.find(c => c.value === parseInt(significantDigitsStr[1]));
    bands[2] = DIGIT_COLORS.find(c => c.value === parseInt(significantDigitsStr[2]));
    bands[3] = multiplierColor;
  }

  return bands.map(b => b === undefined ? RESISTOR_COLORS.NONE : b);
}

import type React from 'react';
import { cn } from '@/lib/utils';

interface ResistorSVGProps {
  bandColors: string[]; // Array of CSS color strings
  numBands: 4 | 5 | 6;
  animatedBandIndex?: number | null;
}

const ResistorSVG: React.FC<ResistorSVGProps> = ({ bandColors, numBands, animatedBandIndex }) => {
  const bodyWidth = 200;
  const bodyHeight = 80;
  const wireLength = 50;
  const wireThickness = 6;
  const bandWidth = 18;
  const bandSpacing = 8; // Spacing from resistor edge and between bands

  const totalBandsWidth = numBands * bandWidth + (numBands - 1) * (bandSpacing / 2);
  let startX;

  if (numBands === 4) {
    startX = (bodyWidth - (2 * bandWidth + (bandSpacing/2) + bandWidth + bandSpacing + bandWidth)) / 2 + bandSpacing;
  } else if (numBands === 5) {
     startX = (bodyWidth - (3 * bandWidth + 2 * (bandSpacing/2) + bandWidth + bandSpacing + bandWidth)) / 2 + bandSpacing;
  } else { // 6 bands
     startX = (bodyWidth - (3 * bandWidth + 2 * (bandSpacing/2) + bandWidth + bandSpacing + bandWidth + bandSpacing + bandWidth)) / 2 + bandSpacing;
  }


  const bandElements = [];
  let currentX = startX;

  for (let i = 0; i < numBands; i++) {
    // Special spacing for tolerance/TCR bands
    if (numBands === 4 && i === 3) { // Tolerance band for 4-band
      currentX += bandSpacing * 1.5;
    } else if (numBands === 5 && i === 4) { // Tolerance band for 5-band
      currentX += bandSpacing * 1.5;
    } else if (numBands === 6 && i === 4) { // Multiplier-Tolerance gap
      currentX += bandSpacing;
    } else if (numBands === 6 && i === 5) { // Tolerance-TCR gap
      currentX += bandSpacing * 1.5;
    }


    bandElements.push(
      <rect
        key={`band-${i}`}
        x={currentX}
        y="0"
        width={bandWidth}
        height={bodyHeight}
        fill={bandColors[i] || 'transparent'}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="0.5"
        className={cn(
          'transition-colors duration-300 ease-in-out',
          animatedBandIndex === i && 'animate-band-flash'
        )}
      />
    );
    currentX += bandWidth + (bandSpacing / 2);
  }


  return (
    <svg
      viewBox={`0 0 ${bodyWidth + 2 * wireLength} ${bodyHeight}`}
      width="100%"
      height={bodyHeight + 20} // Added padding for shadow/glow
      aria-label={`Resistor with ${numBands} bands`}
      className="drop-shadow-md"
    >
      {/* Wires */}
      <line
        x1="0"
        y1={bodyHeight / 2}
        x2={wireLength}
        y2={bodyHeight / 2}
        stroke="#B0B0B0" // Metallic grey
        strokeWidth={wireThickness}
        strokeLinecap="round"
      />
      <line
        x1={wireLength + bodyWidth}
        y1={bodyHeight / 2}
        x2={wireLength + bodyWidth + wireLength}
        y2={bodyHeight / 2}
        stroke="#B0B0B0"
        strokeWidth={wireThickness}
        strokeLinecap="round"
      />

      {/* Resistor Body */}
      <rect
        x={wireLength}
        y="0"
        width={bodyWidth}
        height={bodyHeight}
        rx="15" // Rounded corners
        ry="15"
        fill="hsl(var(--input))" // Beige color for resistor body
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />

      {/* Bands */}
      <g transform={`translate(${wireLength}, 0)`}>
        {bandElements}
      </g>
    </svg>
  );
};

export default ResistorSVG;

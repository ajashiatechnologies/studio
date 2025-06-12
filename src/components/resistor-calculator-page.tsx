'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ResistorSVG from './resistor-svg';
import ColorBandSelect from './color-band-select';
import { suggestResistorValues, type SuggestResistorValuesInput } from '@/ai/flows/suggest-resistor-values';
import { useToast } from "@/hooks/use-toast";
import {
  RESISTOR_COLORS,
  calculateResistorValues,
  formatResistance,
  getColorsFromValue,
  getBandColors,
  type ColorInfo,
  type CalculationResult,
  type BandType
} from '@/lib/resistor-calc';
import { Zap, Info } from 'lucide-react';

type NumBandsType = 4 | 5 | 6;

const ResistorCalculatorPage: React.FC = () => {
  const [numBands, setNumBands] = useState<NumBandsType>(4);
  const [bandColors, setBandColors] = useState<(ColorInfo | undefined)[]>([]);
  
  const [resistanceInput, setResistanceInput] = useState<string>('');
  const [calculatedResult, setCalculatedResult] = useState<CalculationResult | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [animatedBandIndex, setAnimatedBandIndex] = useState<number | null>(null);

  const { toast } = useToast();

  const getDefaultBandColors = useCallback((bands: NumBandsType): (ColorInfo | undefined)[] => {
    const defaults: (ColorInfo | undefined)[] = [];
    if (bands === 4) {
      defaults.push(RESISTOR_COLORS.BROWN, RESISTOR_COLORS.BLACK, RESISTOR_COLORS.RED, RESISTOR_COLORS.GOLD);
    } else if (bands === 5) {
      defaults.push(RESISTOR_COLORS.BROWN, RESISTOR_COLORS.BLACK, RESISTOR_COLORS.BLACK, RESISTOR_COLORS.RED, RESISTOR_COLORS.BROWN);
    } else { // 6 bands
      defaults.push(RESISTOR_COLORS.BROWN, RESISTOR_COLORS.BLACK, RESISTOR_COLORS.BLACK, RESISTOR_COLORS.RED, RESISTOR_COLORS.BROWN, RESISTOR_COLORS.BROWN);
    }
    return defaults.slice(0, bands);
  }, []);

  useEffect(() => {
    setBandColors(getDefaultBandColors(numBands));
  }, [numBands, getDefaultBandColors]);

  useEffect(() => {
    if (bandColors.length > 0 && bandColors.every(c => c !== undefined)) {
      const result = calculateResistorValues(numBands, bandColors as ColorInfo[]);
      setCalculatedResult(result);
      if (result.resistance !== null) {
        setResistanceInput(result.resistance.toString());
      } else {
        setResistanceInput('');
      }
    }
  }, [bandColors, numBands]);

  const handleBandColorChange = (index: number, colorName: string) => {
    const newColor = Object.values(RESISTOR_COLORS).find(c => c.name === colorName);
    const newBandColors = [...bandColors];
    newBandColors[index] = newColor;
    setBandColors(newBandColors);
    setAnimatedBandIndex(index);
    setTimeout(() => setAnimatedBandIndex(null), 300); // Animation duration
  };

  const handleNumBandsChange = (value: string) => {
    const newNumBands = parseInt(value) as NumBandsType;
    setNumBands(newNumBands);
    // Reset AI suggestion when band count changes
    setAiSuggestion('');
  };
  
  const handleResistanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setResistanceInput(value);
    // Debounced update or update on blur might be better for performance
    // For now, direct update
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      const newColors = getColorsFromValue(numericValue, numBands);
      // Only update if newColors are valid and different to prevent loops
      if (newColors.every(c => c) && JSON.stringify(newColors) !== JSON.stringify(bandColors)) {
         setBandColors(newColors.slice(0, numBands));
      }
      fetchAiSuggestion(numericValue);
    } else if (value === '') {
      setAiSuggestion('');
      // Optionally reset bands to default or clear them
      // setBandColors(getDefaultBandColors(numBands));
    }
  };

  const fetchAiSuggestion = useCallback(async (resistance: number) => {
    if (isNaN(resistance) || resistance <=0) {
      setAiSuggestion('');
      return;
    }
    setIsLoadingAi(true);
    setAiSuggestion(''); // Clear previous suggestion
    try {
      const input: SuggestResistorValuesInput = { resistance };
      const result = await suggestResistorValues(input);
      if (result.suggestion) {
        setAiSuggestion(result.suggestion);
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        title: "AI Suggestion Error",
        description: "Could not fetch AI suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAi(false);
    }
  }, [toast]);


  const bandLabels_4 = ["1st Digit", "2nd Digit", "Multiplier", "Tolerance"];
  const bandTypes_4: BandType[] = ["digit1", "digit2", "multiplier", "tolerance"];
  
  const bandLabels_5 = ["1st Digit", "2nd Digit", "3rd Digit", "Multiplier", "Tolerance"];
  const bandTypes_5: BandType[] = ["digit1", "digit2", "digit3", "multiplier", "tolerance"];

  const bandLabels_6 = ["1st Digit", "2nd Digit", "3rd Digit", "Multiplier", "Tolerance", "TCR"];
  const bandTypes_6: BandType[] = ["digit1", "digit2", "digit3", "multiplier", "tolerance", "tcr"];

  const currentBandLabels = numBands === 4 ? bandLabels_4 : numBands === 5 ? bandLabels_5 : bandLabels_6;
  const currentBandTypes = numBands === 4 ? bandTypes_4 : numBands === 5 ? bandTypes_5 : bandTypes_6;

  const displayedBandColors = useMemo(() => {
    return bandColors.map(colorInfo => colorInfo?.cssColor || 'transparent');
  }, [bandColors]);

  return (
    <div className="container mx-auto p-4 font-code">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">ResistorCalc Pro</CardTitle>
          <CardDescription className="font-body">
            Calculate resistor values with precision. Select bands or enter a value.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
             <ResistorSVG bandColors={displayedBandColors} numBands={numBands} animatedBandIndex={animatedBandIndex} />
          </div>

          <div>
            <Label htmlFor="num-bands-select">Number of Bands</Label>
            <Select value={numBands.toString()} onValueChange={handleNumBandsChange}>
              <SelectTrigger id="num-bands-select" className="w-full md:w-1/2">
                <SelectValue placeholder="Select number of bands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 Bands</SelectItem>
                <SelectItem value="5">5 Bands</SelectItem>
                <SelectItem value="6">6 Bands</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-${Math.ceil(numBands / 2)} gap-4`}>
            {currentBandLabels.map((label, index) => (
              <ColorBandSelect
                key={`${numBands}-band-${index}`}
                label={label}
                value={bandColors[index]?.name}
                onChange={(colorName) => handleBandColorChange(index, colorName)}
                options={getBandColors(currentBandTypes[index])}
                disabled={index >= numBands}
              />
            ))}
          </div>
          
          <div>
            <Label htmlFor="resistance-input">Resistance (Ω)</Label>
            <Input
              id="resistance-input"
              type="number"
              placeholder="e.g., 1000 for 1kΩ"
              value={resistanceInput}
              onChange={handleResistanceInputChange}
              min="0"
            />
          </div>

          {isLoadingAi && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 animate-pulse text-accent" />
              <span>Generating AI suggestion...</span>
            </div>
          )}

          {aiSuggestion && (
            <Alert variant="default" className="bg-accent/10 border-accent/50">
              <Info className="h-5 w-5 text-accent" />
              <AlertTitle className="text-accent font-semibold">AI Suggestion</AlertTitle>
              <AlertDescription className="text-accent/90">
                {aiSuggestion}
              </AlertDescription>
            </Alert>
          )}

          {calculatedResult && (
            <Card className="bg-primary/5 border-primary/20 p-4">
              <CardHeader className="p-2">
                <CardTitle className="text-xl text-primary">Calculated Value</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1 text-lg">
                <p><strong>Resistance:</strong> {calculatedResult.resistanceString}</p>
                {calculatedResult.tolerance !== null && (
                  <p><strong>Tolerance:</strong> ±{calculatedResult.tolerance}%</p>
                )}
                {calculatedResult.tcr !== null && numBands === 6 && (
                  <p><strong>TCR:</strong> {calculatedResult.tcr} ppm/°C</p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>Tip: Hover over color options to see them. Values update in real-time.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResistorCalculatorPage;

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { DocumentFormReturn, TextFormattingFieldPath } from "@/lib/document-form-types";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { TypographyH3, TypographyH4 } from "@/components/typography";
import { 
  Bold, 
  Italic, 
  Highlighter, 
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Minus,
  Plus,
  AlignVerticalSpaceBetween,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Minimize2
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { useTextSelectionContext } from "@/lib/providers/text-selection-context";
import { useSelectionContext } from "@/lib/providers/selection-context";
import { 
  TextFormatting, 
  TextFormattingSchema,
  DEFAULT_TEXT_FORMATTING,
  addFormattingToRange, 
  setColorForRange 
} from "@/lib/validation/text-formatting-schema";
import { getParent, getElementNumber } from "@/lib/field-path";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FontSizeType, TextALignType, VerticalAlignType } from "@/lib/validation/text-schema";
import { Slider } from "@/components/ui/slider";
import { ElementType } from "@/lib/validation/element-type";

// Function to get numeric value from fontSize presets
const getFontSizeValue = (size: string): number => {
  switch(size) {
    case FontSizeType.enum.Small: return 12;
    case FontSizeType.enum.Large: return 24;
    case FontSizeType.enum.Medium:
    default: return 16;
  }
};

export function TextFormattingForm() {
  const form: DocumentFormReturn = useFormContext();
  const { currentTextSelection } = useTextSelectionContext();
  const { setCurrentSelection } = useSelectionContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [customFontSize, setCustomFontSize] = React.useState<number>(16);
  
  // Get the parent element path first (only if we have a selection)
  const elementPath = currentTextSelection ? getParent(currentTextSelection.fieldPath) : "";
  
  // Parse the path to get slide index and element index
  let slideIndex = -1;
  let elementIndex = -1;
  let elementType = "";
  
  if (elementPath) {
    const pathParts = elementPath.split('.');
    if (pathParts.length >= 4 && pathParts[0] === 'slides') {
      slideIndex = parseInt(pathParts[1]);
      elementIndex = parseInt(pathParts[3]);
      
      // Get the element type for conditional rendering
      try {
        const element = form.getValues(`slides.${slideIndex}.elements.${elementIndex}`);
        elementType = element && typeof element === 'object' && 'type' in element ? 
          String(element.type) : "";
      } catch (error) {
        console.error("Error getting element type:", error);
      }
    }
  }
  
  // Our delete handler using direct form manipulation
  const handleDeleteElement = React.useCallback(() => {
    if (slideIndex >= 0 && elementIndex >= 0) {
      try {
        // Get current slide elements
        const allElements = form.getValues(`slides.${slideIndex}.elements`);
        
        if (Array.isArray(allElements)) {
          // Create new array without the element to delete
          const newElements = allElements.filter((_, idx) => idx !== elementIndex);
          
          // Update the form with the filtered array
          form.setValue(`slides.${slideIndex}.elements`, newElements);
          
          // Clear selection and close dialog
          setCurrentSelection("", null);
          setDeleteDialogOpen(false);
          
          // Trigger form validation/update
          form.trigger();
        }
      } catch (error) {
        console.error("Error deleting element:", error);
      }
    }
  }, [slideIndex, elementIndex, form, setCurrentSelection, setDeleteDialogOpen]);
  
  // Function to handle delete button click with event prevention
  const handleDeleteButtonClick = React.useCallback((e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    handleDeleteElement();
  }, [handleDeleteElement]);
  
  // Update font size when element path changes
  React.useEffect(() => {
    if (elementPath) {
      try {
        const style = form.getValues(`${elementPath}.style` as any);
        const fontSize = style?.fontSize || FontSizeType.enum.Medium;
        // Set initial custom font size based on preset or saved value
        const numericFontSize = style?.numericFontSize || getFontSizeValue(fontSize);
        setCustomFontSize(numericFontSize);
      } catch (error) {
        // Fallback to default if anything goes wrong
        setCustomFontSize(16);
      }
    }
  }, [elementPath, form]);
  
  // If no text is selected, render nothing
  if (!currentTextSelection) {
    return null;
  }
  
  const { fieldPath, selectionStart, selectionEnd } = currentTextSelection;
  
  // Get the formatting path
  const formattingPath = `${elementPath}.formatting` as TextFormattingFieldPath;
  
  // Get the current formatting safely - using 'as any' to bypass type checking
  // which is safer than trying to navigate the complex path structure
  let currentFormatting: TextFormatting;
  try {
    // Try to get the current formatting
    const formattingValue = form.getValues(formattingPath as any);
    // Ensure it's a valid formatting object or use the default
    currentFormatting = formattingValue || DEFAULT_TEXT_FORMATTING;
  } catch (error) {
    // Use default formatting if there's an error
    currentFormatting = DEFAULT_TEXT_FORMATTING;
  }
  
  // Find current formatting for this selection range
  const currentRange = currentFormatting?.ranges?.find(
    range => range.start === selectionStart && range.end === selectionEnd
  );
  
  // Default formatting states
  const isBold = currentRange?.bold || false;
  const isItalic = currentRange?.italic || false;
  const isHighlighted = currentRange?.highlight || false;
  const textColor = currentRange?.color || "";
  
  // Get the style from the element
  const style = form.getValues(`${elementPath}.style` as any);
  const fontSize = style?.fontSize || FontSizeType.enum.Medium;
  const textAlign = style?.align || TextALignType.enum.Left;
  const verticalAlign = style?.verticalAlign || VerticalAlignType.enum.Top;
  
  // Handle formatting toggles
  const toggleFormatting = (formatType: "bold" | "italic" | "highlight", currentValue: boolean) => {
    const newFormatting = addFormattingToRange(
      currentFormatting,
      selectionStart,
      selectionEnd,
      formatType,
      !currentValue
    );
    
    form.setValue(formattingPath as any, newFormatting);
  };
  
  // Handle color change
  const handleColorChange = (color: string) => {
    const newFormatting = setColorForRange(
      currentFormatting,
      selectionStart,
      selectionEnd,
      color || null
    );
    
    form.setValue(formattingPath as any, newFormatting);
  };

  // Handle font size change from preset dropdown
  const handleFontSizeChange = (size: string) => {
    form.setValue(`${elementPath}.style.fontSize` as any, size);
    // Also update numeric font size to match preset
    const numericSize = getFontSizeValue(size);
    setCustomFontSize(numericSize);
    form.setValue(`${elementPath}.style.numericFontSize` as any, numericSize);
  };

  // Handle custom font size change
  const handleCustomFontSizeChange = (value: number) => {
    setCustomFontSize(value);
    form.setValue(`${elementPath}.style.numericFontSize` as any, value);
    
    // Also update the preset based on the numeric value
    let preset: FontSizeType = FontSizeType.enum.Medium;
    if (value <= 12) {
      preset = FontSizeType.enum.Small as FontSizeType;
    } else if (value >= 20) {
      preset = FontSizeType.enum.Large as FontSizeType;
    }
    
    form.setValue(`${elementPath}.style.fontSize` as any, preset);
  };

  // Handle increment/decrement for font size
  const adjustFontSize = (amount: number) => {
    const newSize = Math.max(8, Math.min(36, customFontSize + amount));
    handleCustomFontSizeChange(newSize);
  };

  // Handle text alignment change
  const handleTextAlignChange = (align: string) => {
    form.setValue(`${elementPath}.style.align` as any, align);
  };
  
  // Handle vertical alignment change
  const handleVerticalAlignChange = (valign: string) => {
    form.setValue(`${elementPath}.style.verticalAlign` as any, valign);
  };

  // Handle width adjustment for description elements
  const handleWidthChange = (width: number) => {
    form.setValue(`${elementPath}.style.width` as any, width);
  };

  // Handle line height change
  const handleLineHeightChange = (value: number) => {
    form.setValue(`${elementPath}.style.lineHeight` as any, value);
  };

  // Handle word spacing change
  const handleWordSpacingChange = (value: number) => {
    form.setValue(`${elementPath}.style.wordSpacing` as any, value);
  };
  
  return (
    <div className="w-full py-4 max-w-full overflow-hidden px-2">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <Type className="h-5 w-5 text-primary" />
            <TypographyH3>Text Formatting</TypographyH3>
          </div>
          <Button 
            variant="destructive" 
            size="icon"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteDialogOpen(true);
            }}
            className="h-8 w-8"
            title="Delete element"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Format the selected text
          </p>
        </div>
        
        <Separator className="my-4" />
        
      {/* Style section */}
      <div className="space-y-4 mb-5">
        <TypographyH4 className="flex items-center gap-2 mb-2">
            <Bold className="h-4 w-4 text-primary" />
            <span>Style</span>
          </TypographyH4>
          
        <div className="flex items-center justify-center space-x-3 w-full">
            <Toggle 
              pressed={isBold}
              onPressedChange={() => toggleFormatting("bold", isBold)}
              aria-label="Toggle bold"
            className="data-[state=on]:bg-primary data-[state=on]:text-white flex-1"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            
            <Toggle 
              pressed={isItalic}
              onPressedChange={() => toggleFormatting("italic", isItalic)}
              aria-label="Toggle italic"
            className="data-[state=on]:bg-primary data-[state=on]:text-white flex-1"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            
            <Toggle 
              pressed={isHighlighted}
              onPressedChange={() => toggleFormatting("highlight", isHighlighted)}
              aria-label="Toggle highlight"
            className="data-[state=on]:bg-primary data-[state=on]:text-white flex-1"
            >
              <Highlighter className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
        
      {/* Font Size section */}
      <div className="space-y-3 mb-5">
        <TypographyH4 className="flex items-center gap-2 mb-2">
          <Type className="h-4 w-4 text-primary" />
          <span>Font Size</span>
        </TypographyH4>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => adjustFontSize(-1)}
            className="h-8 w-8"
            type="button"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <div className="flex-1">
            <Slider
              value={[customFontSize]}
              min={2}
              max={36}
              step={1}
              onValueChange={(value) => handleCustomFontSizeChange(value[0])}
              className="py-1"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => adjustFontSize(1)}
            className="h-8 w-8"
            type="button"
          >
            <Plus className="h-3 w-3" />
          </Button>
          
          <div className="w-16 text-center font-mono text-sm bg-muted/30 py-1 px-2 rounded">
            {customFontSize}px
          </div>
        </div>
      </div>
      
      {/* Line Height section */}
      <div className="space-y-3 mb-5">
        <TypographyH4 className="flex items-center gap-2 mb-2">
          <AlignVerticalSpaceBetween className="h-4 w-4 text-primary" />
          <span>Line Height</span>
        </TypographyH4>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Slider
              value={[form.getValues(`${elementPath}.style.lineHeight` as any) || 1.5]}
              min={1.0}
              max={2.5}
              step={0.1}
              onValueChange={(value) => handleLineHeightChange(value[0])}
              className="py-1"
            />
          </div>
          
          <div className="w-16 text-center font-mono text-sm bg-muted/30 py-1 px-2 rounded">
            {(form.getValues(`${elementPath}.style.lineHeight` as any) || 1.5).toFixed(1)}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Adjust spacing between lines of text
        </p>
      </div>
      
      {/* Word Spacing section */}
      <div className="space-y-3 mb-5">
        <TypographyH4 className="flex items-center gap-2 mb-2">
          <Minimize2 className="h-4 w-4 text-primary" />
          <span>Word Spacing</span>
        </TypographyH4>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Slider
              value={[form.getValues(`${elementPath}.style.wordSpacing` as any) || 0]}
              min={-2}
              max={10}
              step={0.5}
              onValueChange={(value) => handleWordSpacingChange(value[0])}
              className="py-1"
            />
          </div>
          
          <div className="w-16 text-center font-mono text-sm bg-muted/30 py-1 px-2 rounded">
            {(form.getValues(`${elementPath}.style.wordSpacing` as any) || 0).toFixed(1)}px
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Adjust spacing between words
        </p>
      </div>
      
      {/* Width adjustment for description elements */}
      {elementType === ElementType.enum.Description && (
        <div className="space-y-3 mb-5">
          <TypographyH4 className="flex items-center gap-2 mb-2">
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Element Width</span>
          </TypographyH4>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Slider
                value={[form.getValues(`${elementPath}.style.width` as any) || 100]}
                min={50}
                max={100}
                step={5}
                onValueChange={(value) => handleWidthChange(value[0])}
                className="py-1"
              />
            </div>
            
            <div className="w-16 text-center font-mono text-sm bg-muted/30 py-1 px-2 rounded">
              {form.getValues(`${elementPath}.style.width` as any) || 100}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Adjust the width of the description text element
          </p>
        </div>
      )}
      
      {/* Horizontal Alignment section */}
      <div className="space-y-3 mb-5">
        <TypographyH4 className="flex items-center gap-2 mb-2">
          <AlignCenter className="h-4 w-4 text-primary" />
          <span>Alignment</span>
        </TypographyH4>
        
        <div className="flex items-center justify-between w-full gap-2">
          <Toggle 
            pressed={textAlign === TextALignType.enum.Left}
            onPressedChange={() => handleTextAlignChange(TextALignType.enum.Left)}
            aria-label="Align left"
            className={`flex-1 mx-1 ${textAlign === TextALignType.enum.Left ? 'bg-primary text-white border-primary' : 'bg-muted'}`}
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          
          <Toggle 
            pressed={textAlign === TextALignType.enum.Center}
            onPressedChange={() => handleTextAlignChange(TextALignType.enum.Center)}
            aria-label="Align center"
            className={`flex-1 mx-1 ${textAlign === TextALignType.enum.Center ? 'bg-primary text-white border-primary' : 'bg-muted'}`}
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          
          <Toggle 
            pressed={textAlign === TextALignType.enum.Right}
            onPressedChange={() => handleTextAlignChange(TextALignType.enum.Right)}
            aria-label="Align right"
            className={`flex-1 mx-1 ${textAlign === TextALignType.enum.Right ? 'bg-primary text-white border-primary' : 'bg-muted'}`}
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
        </div>
      </div>
      
      {/* Vertical Alignment section */}
      <div className="space-y-3 mb-5">
        <TypographyH4 className="flex items-center gap-2 mb-2">
          <AlignVerticalSpaceBetween className="h-4 w-4 text-primary" />
          <span>Vertical Position</span>
        </TypographyH4>
        
        <div className="flex items-center justify-between w-full gap-2">
          <Toggle 
            pressed={verticalAlign === VerticalAlignType.enum.Top}
            onPressedChange={() => handleVerticalAlignChange(VerticalAlignType.enum.Top)}
            aria-label="Align top"
            className={`flex-1 ${verticalAlign === VerticalAlignType.enum.Top ? 'bg-primary text-white border-primary' : 'bg-muted'}`}
          >
            <span className="flex flex-col items-center justify-center">
              <ArrowUp className="h-4 w-4" />
              <span className="text-xs mt-1">Top</span>
            </span>
          </Toggle>
          
          <Toggle 
            pressed={verticalAlign === VerticalAlignType.enum.Middle}
            onPressedChange={() => handleVerticalAlignChange(VerticalAlignType.enum.Middle)}
            aria-label="Align middle"
            className={`flex-1 ${verticalAlign === VerticalAlignType.enum.Middle ? 'bg-primary text-white border-primary' : 'bg-muted'}`}
          >
            <span className="flex flex-col items-center justify-center">
              <AlignVerticalSpaceBetween className="h-4 w-4" />
              <span className="text-xs mt-1">Middle</span>
            </span>
          </Toggle>
          
          <Toggle 
            pressed={verticalAlign === VerticalAlignType.enum.Bottom}
            onPressedChange={() => handleVerticalAlignChange(VerticalAlignType.enum.Bottom)}
            aria-label="Align bottom"
            className={`flex-1 ${verticalAlign === VerticalAlignType.enum.Bottom ? 'bg-primary text-white border-primary' : 'bg-muted'}`}
          >
            <span className="flex flex-col items-center justify-center">
              <ArrowDown className="h-4 w-4" />
              <span className="text-xs mt-1">Bottom</span>
            </span>
          </Toggle>
        </div>
      </div>
      
      {/* Color section */}
      <div className="space-y-3">
        <TypographyH4 className="flex items-center gap-2 mb-2">
            <Palette className="h-4 w-4 text-primary" />
            <span>Color</span>
          </TypographyH4>
          
        <div>
          <div className="flex items-center gap-2 mb-2">
              <Input 
                type="color" 
                value={textColor || "#000000"}
                onChange={(e) => handleColorChange(e.target.value)}
              className="w-10 h-10 p-1 min-w-[2.5rem] cursor-pointer" 
              />
              <Input 
                value={textColor || ""}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="Text color"
              className="w-full font-mono text-sm" 
              />
            </div>
          </div>
          
          {textColor && (
            <button
              type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleColorChange("")}
            >
              Clear color
            </button>
          )}
        </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Text Element</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this text element? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDeleteButtonClick}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
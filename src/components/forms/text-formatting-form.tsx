import React from "react";
import { useFormContext } from "react-hook-form";
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
  Type
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { useTextSelectionContext } from "@/lib/providers/text-selection-context";
import { 
  TextFormatting, 
  TextFormattingSchema,
  DEFAULT_TEXT_FORMATTING,
  addFormattingToRange, 
  setColorForRange 
} from "@/lib/validation/text-formatting-schema";
import { getParent } from "@/lib/field-path";

export function TextFormattingForm() {
  const form: DocumentFormReturn = useFormContext();
  const { currentTextSelection } = useTextSelectionContext();
  
  // Don't return early here, process all hooks first
  
  // If no text is selected, render nothing but only after hook execution
  if (!currentTextSelection) {
    return null;
  }
  
  const { fieldPath, selectionStart, selectionEnd } = currentTextSelection;
  
  // Get the parent element path
  const elementPath = getParent(fieldPath);
  
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
  
  return (
    <Form {...form}>
      <form className="space-y-4 w-full py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <TypographyH3>Text Formatting</TypographyH3>
          </div>
          <p className="text-sm text-muted-foreground">
            Format the selected text
          </p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <TypographyH4 className="flex items-center gap-2">
            <Bold className="h-4 w-4 text-primary" />
            <span>Style</span>
          </TypographyH4>
          
          <div className="flex items-center gap-2">
            <Toggle 
              pressed={isBold}
              onPressedChange={() => toggleFormatting("bold", isBold)}
              aria-label="Toggle bold"
              className="data-[state=on]:bg-primary data-[state=on]:text-white"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            
            <Toggle 
              pressed={isItalic}
              onPressedChange={() => toggleFormatting("italic", isItalic)}
              aria-label="Toggle italic"
              className="data-[state=on]:bg-primary data-[state=on]:text-white"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            
            <Toggle 
              pressed={isHighlighted}
              onPressedChange={() => toggleFormatting("highlight", isHighlighted)}
              aria-label="Toggle highlight"
              className="data-[state=on]:bg-primary data-[state=on]:text-white"
            >
              <Highlighter className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
        
        <div className="space-y-4">
          <TypographyH4 className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <span>Color</span>
          </TypographyH4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                value={textColor || "#000000"}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 p-1" 
              />
              <Input 
                value={textColor || ""}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="Text color"
                className="w-full font-mono" 
              />
            </div>
          </div>
          
          {textColor && (
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => handleColorChange("")}
            >
              Clear color
            </button>
          )}
        </div>
      </form>
    </Form>
  );
} 
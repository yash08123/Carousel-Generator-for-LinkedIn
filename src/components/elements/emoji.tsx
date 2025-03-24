import React from "react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { EmojiSchema } from "@/lib/validation/emoji-schema";
import { useSelectionContext } from "@/lib/providers/selection-context";
import { getParent } from "@/lib/field-path";
import { usePagerContext } from "@/lib/providers/pager-context";

// Define the allowed values for size and alignment
type SizeType = "Small" | "Medium" | "Large";
type AlignmentType = "Left" | "Center" | "Right";

interface EmojiProps {
  fieldName: string;
  className?: string;
}

export function Emoji({ fieldName, className }: EmojiProps) {
  const form: DocumentFormReturn = useFormContext();
  const { watch, getValues } = form;
  const { setCurrentSelection } = useSelectionContext();
  const { setCurrentPage } = usePagerContext();
  
  // Use getValues instead of watch with template literals
  const values = getValues();
  // Find the field value by traversing the path
  let fieldValue: any = values;
  const pathParts = fieldName.split('.');
  for (const part of pathParts) {
    if (fieldValue && typeof fieldValue === 'object') {
      fieldValue = fieldValue[part];
    } else {
      fieldValue = undefined;
      break;
    }
  }
  
  // Extract the values
  const emoji = fieldValue?.emoji || "😊";
  const style = fieldValue?.style || {};
  
  // Safely get the style values with default fallbacks
  const size = (style.size as SizeType) || "Medium";
  const alignment = (style.alignment as AlignmentType) || "Center";

  const sizeClasses = {
    Small: "text-4xl",
    Medium: "text-6xl",
    Large: "text-8xl",
  };

  const alignmentClasses = {
    Left: "text-left self-start",
    Center: "text-center self-center",
    Right: "text-right self-end",
  };

  return (
    <div 
      className={cn(
        "flex my-2 w-full justify-center", 
        alignmentClasses[alignment],
        className
      )}
      onClick={(event) => {
        event.stopPropagation();
        setCurrentSelection(fieldName, event);
        // If needed, also set the current page
        const pageMatch = fieldName.match(/slides\.(\d+)/);
        if (pageMatch && pageMatch[1]) {
          setCurrentPage(parseInt(pageMatch[1]));
        }
      }}
    >
      <div 
        className={cn(
          "emoji-display cursor-pointer", 
          sizeClasses[size],
        )}
      >
        {emoji}
      </div>
    </div>
  );
} 
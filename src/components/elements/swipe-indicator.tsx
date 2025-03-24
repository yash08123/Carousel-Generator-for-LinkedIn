import React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { useSelectionContext } from "@/lib/providers/selection-context";
import { usePagerContext } from "@/lib/providers/pager-context";
import { SwipeIndicatorPosition, SwipeIndicatorShape, SwipeIndicatorSize } from "@/lib/validation/swipe-indicator-schema";

interface SwipeIndicatorProps {
  className?: string;
  fieldName: string;
  index?: number;
}

export function SwipeIndicator({
  className,
  fieldName,
  index,
}: SwipeIndicatorProps) {
  const { watch }: DocumentFormReturn = useFormContext();
  const { currentSelection, setCurrentSelection } = useSelectionContext();
  const { setCurrentPage } = usePagerContext();
  
  // Determine if this indicator is selected
  const isSelected = currentSelection === fieldName;
  
  // Watch for swipe indicator settings and theme colors
  const swipeConfig = watch("config.swipeIndicator");
  const primaryColor = watch("config.theme.primary");
  
  // If swipe indicator is turned off, don't render
  if (!swipeConfig.showSwipeIndicator) {
    return null;
  }

  // Determine text color based on color brightness
  const getBrightness = (hexColor: string) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness using the HSP color model
    return Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );
  };
  
  // Determine background color
  const backgroundColor = swipeConfig.useThemeColor ? primaryColor : swipeConfig.customColor;
  const brightness = getBrightness(backgroundColor);
  const textColor = brightness > 160 ? '#000000' : '#FFFFFF';

  // Get position classes
  const getPositionClasses = () => {
    switch(swipeConfig.position) {
      case SwipeIndicatorPosition.BottomLeft:
        return "bottom-4 left-4";
      case SwipeIndicatorPosition.BottomCenter:
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      case SwipeIndicatorPosition.TopRight:
        return "top-4 right-4";
      case SwipeIndicatorPosition.BottomRight:
      default:
        return "bottom-4 right-4";
    }
  };

  // Get shape classes
  const getShapeClasses = () => {
    switch(swipeConfig.shape) {
      case SwipeIndicatorShape.Rectangle:
        return "rounded-sm";
      case SwipeIndicatorShape.Rounded:
        return "rounded-md";
      case SwipeIndicatorShape.Pill:
      default:
        return "rounded-full";
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch(swipeConfig.size) {
      case SwipeIndicatorSize.Small:
        return "px-2 py-1 text-xs";
      case SwipeIndicatorSize.Large:
        return "px-4 py-2 text-base";
      case SwipeIndicatorSize.Medium:
      default:
        return "px-3 py-1.5 text-sm";
    }
  };

  return (
    <div 
      className={cn(
        "absolute flex items-center gap-1 font-medium cursor-pointer transition-all hover:scale-105",
        getPositionClasses(),
        getShapeClasses(),
        getSizeClasses(),
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )} 
      style={{
        backgroundColor,
        color: textColor,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (index !== undefined) {
          setCurrentPage(index);
        }
        setCurrentSelection(fieldName, e);
      }}
    >
      <span>{swipeConfig.customText}</span>
      <ChevronRight className={cn(
        swipeConfig.size === SwipeIndicatorSize.Small ? "h-3 w-3" :
        swipeConfig.size === SwipeIndicatorSize.Large ? "h-5 w-5" :
        "h-4 w-4"
      )} />
    </div>
  );
} 
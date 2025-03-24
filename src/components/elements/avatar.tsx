import React from "react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { AvatarSchema } from "@/lib/validation/avatar-schema";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { useSelectionContext } from "@/lib/providers/selection-context";
import { getParent } from "@/lib/field-path";
import { usePagerContext } from "@/lib/providers/pager-context";

// Define the allowed values for size, alignment and shape
type SizeType = "Small" | "Medium" | "Large";
type AlignmentType = "Left" | "Center" | "Right";
type ShapeType = "Circle" | "Square" | "Rounded";

interface AvatarProps {
  fieldName: string;
  className?: string;
}

export function Avatar({ fieldName, className }: AvatarProps) {
  const form: DocumentFormReturn = useFormContext();
  const { watch } = form;
  const { setCurrentSelection } = useSelectionContext();
  const { setCurrentPage } = usePagerContext();
  
  // Get style safely by watching the entire field and accessing style property
  const fieldValue = watch(fieldName as any);
  const style = fieldValue?.style;
  const brandAvatar = watch("config.brand.avatar");

  // Safely get the values with default fallbacks
  const size = (style?.size as SizeType) || "Medium";
  const alignment = (style?.alignment as AlignmentType) || "Center";
  const shape = (style?.shape as ShapeType) || "Circle";

  const sizeClasses = {
    Small: "w-24 h-24",
    Medium: "w-40 h-40",
    Large: "w-56 h-56",
  };

  const alignmentClasses = {
    Left: "self-start",
    Center: "self-center",
    Right: "self-end",
  };

  const shapeClasses = {
    Circle: "rounded-full",
    Square: "rounded-none",
    Rounded: "rounded-lg",
  };

  // Default fallback if no avatar is set
  const renderFallback = () => (
    <div className={cn(
      "flex items-center justify-center bg-muted cursor-pointer",
      sizeClasses[size],
      shapeClasses[shape]
    )}>
      <UserCircle className="text-muted-foreground w-1/2 h-1/2" />
    </div>
  );

  return (
    <div 
      className={cn(
        "flex my-4 w-full justify-center", 
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
      {brandAvatar?.source?.src ? (
        <div className={cn(
          "relative overflow-hidden cursor-pointer",
          sizeClasses[size],
          shapeClasses[shape]
        )}>
          <Image
            src={brandAvatar.source.src}
            alt="Avatar"
            fill
            className="object-cover"
          />
        </div>
      ) : renderFallback()}
    </div>
  );
} 
import * as z from "zod";
import {
  FontSizeType,
  TextALignType,
  TextStyleSchema,
  VerticalAlignType,
} from "@/lib/validation/text-schema";

export function textStyleToClasses({
  style,
  sizes,
}: {
  style: z.infer<typeof TextStyleSchema>;
  sizes: [string, string, string];
}): string {
  const { fontSize, align, verticalAlign, width, numericFontSize } = style;
  const classes = [];

  // Use numeric font size if available, otherwise fall back to preset sizes
  if (numericFontSize !== undefined) {
    // Don't add a font size class - we'll use inline style for exact px value
  } else {
    // Fall back to preset sizes if numeric size is not available
    classes.push(
      fontSize == FontSizeType.enum.Large
        ? sizes[0]
        : fontSize == FontSizeType.enum.Medium
        ? sizes[1]
        : fontSize == FontSizeType.enum.Small
        ? sizes[2]
        : ""
    );
  }
  
  classes.push(
    align == TextALignType.enum.Left
      ? "text-left"
      : align == TextALignType.enum.Center
      ? "text-center"
      : align == TextALignType.enum.Right
      ? "text-right"
      : ""
  );
  
  if (verticalAlign) {
    classes.push(
      verticalAlign == VerticalAlignType.enum.Top
        ? "self-start"
        : verticalAlign == VerticalAlignType.enum.Middle
        ? "self-center"
        : verticalAlign == VerticalAlignType.enum.Bottom
        ? "self-end"
        : ""
    );
  }
  
  // Apply width styles for description elements
  if (width !== undefined && width < 100) {
    // Apply appropriate width classes based on percentage
    if (width <= 50) classes.push("w-1/2 max-w-full mx-auto");
    else if (width <= 60) classes.push("w-3/5 max-w-full mx-auto");
    else if (width <= 70) classes.push("w-2/3 max-w-full mx-auto");
    else if (width <= 75) classes.push("w-3/4 max-w-full mx-auto");
    else if (width <= 80) classes.push("w-4/5 max-w-full mx-auto");
    else if (width <= 90) classes.push("w-11/12 max-w-full mx-auto");
    else classes.push("w-full max-w-full");
  } else {
    // When width is 100% or not specified, use full width with no centering
    classes.push("w-full max-w-full");
  }
  
  return classes.join(" ");
}

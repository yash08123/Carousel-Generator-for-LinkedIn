import * as z from "zod";

// Define a schema for tracking formatting applied to specific ranges of text
export const TextFormattingRangeSchema = z.object({
  start: z.number().default(0),
  end: z.number().default(0),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  highlight: z.boolean().default(false),
  color: z.string().nullable().default(null),
});

export type TextFormattingRange = z.infer<typeof TextFormattingRangeSchema>;

// Schema for all formatting ranges in a text element
export const TextFormattingSchema = z.object({
  ranges: z.array(TextFormattingRangeSchema).default([]),
});

export type TextFormatting = z.infer<typeof TextFormattingSchema>;

// Default empty formatting
export const DEFAULT_TEXT_FORMATTING: TextFormatting = {
  ranges: [],
};

// Helper function to update formatting for a selected range
export function addFormattingToRange(
  formatting: TextFormatting,
  start: number,
  end: number,
  formatType: "bold" | "italic" | "highlight",
  value: boolean
): TextFormatting {
  // No selection or invalid range
  if (start >= end) return formatting;

  const newRanges = [...formatting.ranges];
  
  // Check if there's an existing range with the same start/end
  const existingRangeIndex = newRanges.findIndex(
    range => range.start === start && range.end === end
  );
  
  if (existingRangeIndex >= 0) {
    // Update existing range
    newRanges[existingRangeIndex] = {
      ...newRanges[existingRangeIndex],
      [formatType]: value
    };
  } else {
    // Create a new range
    newRanges.push({
      start,
      end,
      bold: formatType === "bold" ? value : false,
      italic: formatType === "italic" ? value : false,
      highlight: formatType === "highlight" ? value : false,
      color: null
    });
  }
  
  return {
    ranges: newRanges.filter(
      // Remove ranges that have no formatting applied
      range => range.bold || range.italic || range.highlight || range.color
    )
  };
}

// Helper function to update color for a selected range
export function setColorForRange(
  formatting: TextFormatting,
  start: number,
  end: number,
  color: string | null
): TextFormatting {
  // No selection or invalid range
  if (start >= end) return formatting;

  const newRanges = [...formatting.ranges];
  
  // Check if there's an existing range with the same start/end
  const existingRangeIndex = newRanges.findIndex(
    range => range.start === start && range.end === end
  );
  
  if (existingRangeIndex >= 0) {
    // Update existing range
    newRanges[existingRangeIndex] = {
      ...newRanges[existingRangeIndex],
      color
    };
  } else {
    // Create a new range
    newRanges.push({
      start,
      end,
      bold: false,
      italic: false,
      highlight: false,
      color
    });
  }
  
  return {
    ranges: newRanges.filter(
      // Remove ranges that have no formatting applied
      range => range.bold || range.italic || range.highlight || range.color
    )
  };
} 
import * as z from "zod";

export enum ElementType {
  None = "none",
  Gradient = "gradient",
  Grid = "grid",
  Dots = "dots",
  Waves = "waves",
  Geometric = "geometric",
}

// Schema for gradient element properties
export const GradientElementSchema = z.object({
  direction: z.enum(["to-r", "to-l", "to-t", "to-b", "to-tr", "to-tl", "to-br", "to-bl"]).default("to-r"),
  opacity: z.number().min(0).max(100).default(50),
});

// Schema for grid element properties
export const GridElementSchema = z.object({
  size: z.enum(["sm", "md", "lg"]).default("md"),
  opacity: z.number().min(0).max(100).default(50),
  color: z.string().default("currentColor"),
});

// Schema for dots element properties
export const DotsElementSchema = z.object({
  size: z.enum(["sm", "md", "lg"]).default("md"),
  opacity: z.number().min(0).max(100).default(50),
  spacing: z.enum(["tight", "normal", "loose"]).default("normal"),
});

// Schema for waves element properties
export const WavesElementSchema = z.object({
  amplitude: z.enum(["low", "medium", "high"]).default("medium"),
  opacity: z.number().min(0).max(100).default(50),
});

// Schema for geometric element properties
export const GeometricElementSchema = z.object({
  pattern: z.enum(["triangles", "squares", "hexagons"]).default("triangles"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
  opacity: z.number().min(0).max(100).default(50),
});

// Main elements schema that combines all element types
export const ElementsSchema = z.object({
  enabled: z.boolean().default(false),
  type: z.nativeEnum(ElementType).default(ElementType.None),
  gradient: GradientElementSchema.optional(),
  grid: GridElementSchema.optional(),
  dots: DotsElementSchema.optional(),
  waves: WavesElementSchema.optional(),
  geometric: GeometricElementSchema.optional(),
}); 
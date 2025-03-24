import * as z from "zod";

export enum SwipeIndicatorPosition {
  BottomRight = "bottom-right",
  BottomLeft = "bottom-left",
  BottomCenter = "bottom-center",
  TopRight = "top-right",
}

export enum SwipeIndicatorShape {
  Pill = "pill",
  Rectangle = "rectangle",
  Rounded = "rounded",
}

export enum SwipeIndicatorSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

export const SwipeIndicatorSchema = z.object({
  showSwipeIndicator: z.boolean().default(true),
  position: z.nativeEnum(SwipeIndicatorPosition).default(SwipeIndicatorPosition.BottomRight),
  shape: z.nativeEnum(SwipeIndicatorShape).default(SwipeIndicatorShape.Pill),
  size: z.nativeEnum(SwipeIndicatorSize).default(SwipeIndicatorSize.Medium),
  customText: z.string().default("Swipe"),
  useThemeColor: z.boolean().default(true),
  customColor: z.string().default("#1a1a1a"),
});

export type SwipeIndicatorSchemaType = z.infer<typeof SwipeIndicatorSchema>;

export const DEFAULT_SWIPE_INDICATOR: z.infer<typeof SwipeIndicatorSchema> = {
  showSwipeIndicator: true,
  position: SwipeIndicatorPosition.BottomRight,
  shape: SwipeIndicatorShape.Pill,
  size: SwipeIndicatorSize.Medium,
  customText: "Swipe",
  useThemeColor: true,
  customColor: "#1a1a1a",
}; 
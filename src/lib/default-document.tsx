import * as z from "zod";
import { MultiSlideSchema } from "@/lib/validation/slide-schema";
import { SlideType } from "@/lib/validation/slide-schema";

import { getDefaultSlideOfType } from "@/lib/default-slides";
import { DEFAULT_IMAGE_INPUT } from "@/lib/validation/image-schema";
import { ElementType } from "./validation/elements-schema";
import { DEFAULT_SWIPE_INDICATOR } from "./validation/swipe-indicator-schema";

const defaultSlideValues: z.infer<typeof MultiSlideSchema> = [
  getDefaultSlideOfType(SlideType.enum.Intro),
  getDefaultSlideOfType(SlideType.enum.Common),
  getDefaultSlideOfType(SlideType.enum.Content),
  getDefaultSlideOfType(SlideType.enum.Content),
  getDefaultSlideOfType(SlideType.enum.Outro),
];

export const defaultValues = {
  slides: defaultSlideValues,
  config: {
    brand: {
      avatar: DEFAULT_IMAGE_INPUT,

      name: "My name",
      handle: "@name",
    },
    theme: {
      isCustom: false,
      pallette: "dracula",
      primary: "#ff79c6",
      secondary: "#bd93f9",
      background: "#282a36",
    },
    fonts: {
      font1: "DM_Serif_Display",
      font2: "DM_Sans",
    },
    pageNumber: {
      showNumbers: true,
    },
    swipeIndicator: DEFAULT_SWIPE_INDICATOR,
    elements: {
      enabled: false,
      type: ElementType.None,
      gradient: {
        direction: "to-r",
        opacity: 50,
      },
      grid: {
        size: "md",
        opacity: 50,
        color: "currentColor",
      },
      dots: {
        size: "md",
        opacity: 50,
        spacing: "normal",
      },
      waves: {
        amplitude: "medium",
        opacity: 50,
      },
      geometric: {
        pattern: "triangles",
        size: "md",
        opacity: 50,
      },
    },
  },
  filename: "My Carousel File",
};

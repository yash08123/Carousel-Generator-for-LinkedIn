import * as z from "zod";
import { CommonSlideSchema } from "./validation/slide-schema";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_SUBTITLE,
  DEFAULT_TITLE,
} from "./validation/text-schema";

import {
  DEFAULT_BACKGROUND_IMAGE_INPUT,
  DEFAULT_CONTENT_IMAGE_INPUT,
} from "./validation/image-schema";
import { SlideType } from "@/lib/validation/slide-schema";
import { DEFAULT_EMOJI } from "./validation/emoji-schema";
import { DEFAULT_AVATAR } from "./validation/avatar-schema";
import { IntroSlideStyle } from "@/components/intro-slide-style-dialog";
import { OutroSlideStyle } from "@/components/outro-slide-style-dialog";
import { ContentSlideStyle } from "@/components/content-slide-style-dialog";

export const COMMON_PAGE: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_SUBTITLE, DEFAULT_CONTENT_IMAGE_INPUT],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
};

// Default Content Slide with Text and Image
export const CONTENT: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_SUBTITLE, DEFAULT_CONTENT_IMAGE_INPUT],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: ContentSlideStyle.TextImage,
};

// Content Slide with Text Only
export const CONTENT_TEXT: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_SUBTITLE, DEFAULT_DESCRIPTION],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: ContentSlideStyle.Text,
};

// Content Slide with Image Only
export const CONTENT_IMAGE: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_CONTENT_IMAGE_INPUT],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: ContentSlideStyle.Image,
};

// Content Slide optimized for Screenshots
export const CONTENT_SCREENSHOT: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_CONTENT_IMAGE_INPUT, DEFAULT_DESCRIPTION],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: ContentSlideStyle.Screenshot,
};

// Default Classic Intro Slide
export const INTRO_CLASSIC: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_CONTENT_IMAGE_INPUT],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: IntroSlideStyle.Classic,
};

// Intro Slide with Emoji
export const INTRO_EMOJI: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_EMOJI, DEFAULT_SUBTITLE],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: IntroSlideStyle.Emoji,
};

// Intro Slide with Avatar/Headshot
export const INTRO_HEADSHOT: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_AVATAR, DEFAULT_SUBTITLE],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: IntroSlideStyle.Headshot,
};

// Default Classic Outro Slide
export const OUTRO_CLASSIC: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_SUBTITLE, DEFAULT_DESCRIPTION],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: OutroSlideStyle.Classic,
};

// Outro Slide with Avatar/Headshot
export const OUTRO_HEADSHOT: z.infer<typeof CommonSlideSchema> = {
  elements: [DEFAULT_TITLE, DEFAULT_AVATAR, DEFAULT_DESCRIPTION],
  backgroundImage: DEFAULT_BACKGROUND_IMAGE_INPUT,
  slideStyle: OutroSlideStyle.Headshot,
};

export function getDefaultSlideOfType(slideType: SlideType, slideStyle?: string) {
  if (slideType == SlideType.enum.Content) {
    // Return content slide based on style
    if (slideStyle === ContentSlideStyle.Text) {
      return { ...CONTENT_TEXT };
    } else if (slideStyle === ContentSlideStyle.Image) {
      return { ...CONTENT_IMAGE };
    } else if (slideStyle === ContentSlideStyle.Screenshot) {
      return { ...CONTENT_SCREENSHOT };
    } else {
      // Default to text+image
      return { ...CONTENT };
    }
  } else if (slideType == SlideType.enum.Intro) {
    // Return intro slide based on style
    if (slideStyle === IntroSlideStyle.Emoji) {
      return { ...INTRO_EMOJI };
    } else if (slideStyle === IntroSlideStyle.Headshot) {
      return { ...INTRO_HEADSHOT };
    } else {
      // Default to classic
      return { ...INTRO_CLASSIC };
    }
  } else if (slideType == SlideType.enum.Outro) {
    // Return outro slide based on style
    if (slideStyle === OutroSlideStyle.Headshot) {
      return { ...OUTRO_HEADSHOT };
    } else {
      // Default to classic
      return { ...OUTRO_CLASSIC };
    }
  } else {
    return { ...COMMON_PAGE };
  }
}

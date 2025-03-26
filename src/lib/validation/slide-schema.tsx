import * as z from "zod";
import {
  ContentImageSchema,
  DEFAULT_BACKGROUND_IMAGE_INPUT,
  DEFAULT_CONTENT_IMAGE_INPUT,
  ImageSchema,
} from "./image-schema";
import {
  TitleSchema,
  SubtitleSchema,
  DescriptionSchema,
  UnstyledTitleSchema,
  UnstyledSubtitleSchema,
  UnstyledDescriptionSchema,
} from "./text-schema";
import { EmojiSchema } from "./emoji-schema";
import { AvatarSchema } from "./avatar-schema";

export const SlideType = z.enum(["Intro", "Content", "Outro", "Common"]);
export type SlideType = z.infer<typeof SlideType>;

export const UnstyledElementSchema = z.discriminatedUnion("type", [
  UnstyledTitleSchema,
  UnstyledSubtitleSchema,
  UnstyledDescriptionSchema,
]);

export const ElementSchema = z.discriminatedUnion("type", [
  TitleSchema,
  SubtitleSchema,
  DescriptionSchema,
  ContentImageSchema,
  ImageSchema,
  EmojiSchema,
  AvatarSchema,
]);

export const UnstyledSlideSchema = z.object({
  elements: z.array(UnstyledElementSchema).max(3),
});

// TODO: Convert into: elements prop with an array of discriminated union of types
export const CommonSlideSchema = z.object({
  elements: z.array(ElementSchema).default([]),
  backgroundImage: ImageSchema.default(DEFAULT_BACKGROUND_IMAGE_INPUT),
  slideStyle: z.string().optional(),
  // Element visibility toggles
  showTagline: z.boolean().default(true),
  showTitle: z.boolean().default(true),
  showParagraph: z.boolean().default(true),
  showSwipeIndicator: z.boolean().default(true),
  showBackgroundImage: z.boolean().default(false),
});

export const UnstyledMultiSlideSchema = z.array(UnstyledSlideSchema);

export const MultiSlideSchema = z.array(CommonSlideSchema);

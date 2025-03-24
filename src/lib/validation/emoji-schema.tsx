import { ElementType } from "@/lib/validation/element-type";
import * as z from "zod";

export const EmojiStyleSchema = z.object({
  size: z.enum(["Small", "Medium", "Large"]).default("Medium"),
  alignment: z.enum(["Left", "Center", "Right"]).default("Center"),
}).default({});

export const EmojiSchema = z.object({
  type: z.literal(ElementType.enum.Emoji).default(ElementType.enum.Emoji),
  emoji: z.string().default("😊"),
  style: EmojiStyleSchema.default({}),
});

export const DEFAULT_EMOJI: z.infer<typeof EmojiSchema> = EmojiSchema.parse({
  emoji: "😊",
}); 
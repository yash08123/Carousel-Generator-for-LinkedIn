import { ElementType } from "@/lib/validation/element-type";
import * as z from "zod";

export const AvatarStyleSchema = z.object({
  size: z.enum(["Small", "Medium", "Large"]).default("Medium"),
  alignment: z.enum(["Left", "Center", "Right"]).default("Center"),
  shape: z.enum(["Circle", "Square", "Rounded"]).default("Circle"),
}).default({});

export const AvatarSchema = z.object({
  type: z.literal(ElementType.enum.Avatar).default(ElementType.enum.Avatar),
  // The avatar will use the brand avatar, so we don't need to store it here
  style: AvatarStyleSchema.default({}),
});

export const DEFAULT_AVATAR: z.infer<typeof AvatarSchema> = AvatarSchema.parse({}); 
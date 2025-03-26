import React from "react";
import * as z from "zod";
import { ConfigSchema } from "@/lib/validation/document-schema";
import { cn } from "@/lib/utils";
import { fontIdToClassName } from "@/lib/fonts-map";
import { TitleSchema } from "@/lib/validation/text-schema";
import { textStyleToClasses } from "@/lib/text-style-to-classes";
import { useFormContext } from "react-hook-form";
import {
  DocumentFormReturn,
  TextFieldPath,
  TextFieldStyle,
  StyleFieldPath,
  TextTextFieldPath,
} from "@/lib/document-form-types";
import { RichTextAreaFormField } from "@/components/forms/fields/rich-text-area-form-field";

export function Title({
  fieldName,
  className = "",
}: {
  fieldName: TextFieldPath;
  className?: string;
}) {
  const form: DocumentFormReturn = useFormContext();
  const { getValues } = form;
  const config = getValues("config");
  const style = getValues(
    `${fieldName}.style` as StyleFieldPath
  ) as TextFieldStyle;
  const textFieldName = (fieldName + ".text") as TextTextFieldPath;
  return (
    <RichTextAreaFormField
      fieldName={textFieldName}
      form={form}
      label={""}
      placeholder={"Your title here"}
      className={cn(
        // text-balance has some issues with text area
        `font-black `,
        textStyleToClasses({
          style: style,
          sizes: ["text-7xl", "text-5xl", "text-3xl"],
        }),
        fontIdToClassName(config.fonts.font1),
        className
      )}
      style={{
        color: config.theme.primary,
        ...(style.numericFontSize ? { fontSize: `${style.numericFontSize}px` } : {}),
        ...(style.lineHeight ? { lineHeight: style.lineHeight } : {}),
        ...(style.wordSpacing !== undefined ? { wordSpacing: `${style.wordSpacing}px` } : {})
      }}
    />
  );
}

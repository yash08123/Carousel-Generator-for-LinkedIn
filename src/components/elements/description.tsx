import React from "react";
import { cn } from "@/lib/utils";
import { fontIdToClassName } from "@/lib/fonts-map";
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

export function Description({
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
      placeholder={"Your description here"}
      className={cn(
        `font-medium`,
        textStyleToClasses({
          style: style,
          sizes: ["text-xl", "text-lg", "text-base"],
        }),
        fontIdToClassName(config.fonts.font2),
        className
      )}
      style={{
        color: config.theme.secondary,
      }}
    />
  );
}

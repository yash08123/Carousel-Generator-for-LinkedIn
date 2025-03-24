import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DocumentFormReturn,
  TextTextFieldPath,
  TextFormattingFieldPath,
} from "@/lib/document-form-types";
import { getParent, getSlideNumber } from "@/lib/field-path";
import { usePagerContext } from "@/lib/providers/pager-context";
import { useSelectionContext } from "@/lib/providers/selection-context";
import { CSSProperties } from "react";
import { RichTextArea } from "@/components/ui/rich-text-area";
import { TextFormattingRange } from "@/lib/validation/text-formatting-schema";

export function RichTextAreaFormField({
  form,
  fieldName,
  label,
  placeholder,
  className = "",
  style = {},
}: {
  form: DocumentFormReturn;
  fieldName: TextTextFieldPath;
  label: string;
  placeholder: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { setCurrentSelection } = useSelectionContext();
  const { setCurrentPage } = usePagerContext();
  const pageNumber = getSlideNumber(fieldName);
  const parentPath = getParent(fieldName);
  const formattingPath = `${parentPath}.formatting` as TextFormattingFieldPath;
  
  // Get formatting from form
  const formatting = form.watch(formattingPath);
  // Get the ranges array from the formatting object, defaulting to an empty array
  const formattingRanges = formatting?.ranges || [];

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className={"space-y-0"}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RichTextArea
              placeholder={placeholder}
              className={className}
              style={style}
              {...field}
              fieldPath={fieldName}
              formattingRanges={formattingRanges}
              onFocus={(event) => {
                setCurrentSelection(parentPath, event);
                setCurrentPage(pageNumber);
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              value={form.getValues(fieldName)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 
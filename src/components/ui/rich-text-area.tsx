"use client";

import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";
import { useTextSelectionContext } from "@/lib/providers/text-selection-context";
import { TextSelectionInfo } from "@/lib/document-form-types";
import { TextFormattingRange } from "@/lib/validation/text-formatting-schema";

export interface RichTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fieldPath?: string;
  formattingRanges?: TextFormattingRange[];
}

const RichTextArea = React.forwardRef<HTMLTextAreaElement, RichTextAreaProps>(
  ({ className, fieldPath, formattingRanges = [], ...props }, ref) => {
    const { setTextSelection, clearTextSelection } = useTextSelectionContext();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // We need to combine both refs - the forwarded ref and our internal ref
    React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    const handleSelectionChange = () => {
      if (!textareaRef.current || !fieldPath) return;
      
      const selectionStart = textareaRef.current.selectionStart;
      const selectionEnd = textareaRef.current.selectionEnd;

      if (selectionStart !== selectionEnd) {
        // Text is selected
        const selection: TextSelectionInfo = {
          fieldPath: fieldPath as any,
          selectionStart,
          selectionEnd,
        };
        setTextSelection(selection);
      } else {
        // No text selected
        clearTextSelection();
      }
    };

    // When the component unmounts, clear the selection
    React.useEffect(() => {
      return () => {
        clearTextSelection();
      };
    }, [clearTextSelection]);

    // Function to apply formatting to the rendered text
    const applyFormatting = (text: string): React.ReactNode[] => {
      if (!formattingRanges || formattingRanges.length === 0) {
        return [text];
      }

      const sortedRanges = [...formattingRanges].sort((a, b) => a.start - b.start);
      const result: React.ReactNode[] = [];
      let lastIndex = 0;

      for (const range of sortedRanges) {
        // Add text before this range
        if (range.start > lastIndex) {
          result.push(text.substring(lastIndex, range.start));
        }

        // Add the formatted text
        const formattedText = text.substring(range.start, range.end);
        let node: React.ReactNode = formattedText;
        
        // Apply different formatting styles
        const style: React.CSSProperties = {};
        
        if (range.bold) {
          style.fontWeight = 'bold';
        }
        
        if (range.italic) {
          style.fontStyle = 'italic';
        }
        
        if (range.highlight) {
          style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        }
        
        if (range.color) {
          style.color = range.color;
        }
        
        result.push(
          <span key={`${range.start}-${range.end}`} style={style}>
            {formattedText}
          </span>
        );

        lastIndex = range.end;
      }

      // Add any remaining text
      if (lastIndex < text.length) {
        result.push(text.substring(lastIndex));
      }

      return result;
    };

    // This is the visible display for formatted text
    const FormattedDisplay = () => {
      const text = props.value as string || '';
      const formattedContent = applyFormatting(text);
      
      return (
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 bottom-0 pointer-events-none whitespace-pre-wrap break-words",
            className
          )}
          style={{
            ...props.style,
            zIndex: 1,
          }}
        >
          {formattedContent}
        </div>
      );
    };

    return (
      <div className="relative w-full">
        {/* The actual textarea (invisible but functional) */}
        <TextareaAutosize
          ref={textareaRef}
          className={cn(
            "w-full rounded-md outline outline-transparent hover:outline-input outline-2 bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden resize-none p-0 z-0 relative",
            className
          )}
          {...props}
          onSelect={handleSelectionChange}
          onClick={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          style={{
            ...props.style,
            color: 'transparent',
            caretColor: props.style?.color || 'inherit',
            background: 'transparent',
            zIndex: 2,
          } as any}
        />
        
        {/* The formatted display layer */}
        <FormattedDisplay />
      </div>
    );
  }
);

RichTextArea.displayName = "RichTextArea";

export { RichTextArea }; 
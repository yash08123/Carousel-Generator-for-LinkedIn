import { useSelectionContext } from "@/lib/providers/selection-context";
import { getStyleSibling, getParent, getElementNumber } from "../lib/field-path";
import { EnumRadioGroupField } from "@/components/forms/fields/enum-radio-group-field";
import {
  DocumentFormReturn,
  ElementFieldPath,
  ImageSourceFieldPath,
  ImageSourceSrcFieldPath,
  ImageStyleObjectFitFieldPath,
  ImageStyleOpacityFieldPath,
  StyleFieldPath,
  TextStyleAlignFieldPath,
  TextStyleFontSizeFieldPath,
} from "@/lib/document-form-types";
import { cn } from "@/lib/utils";
import React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize2,
  Minimize2,
  Type,
  Square,
  Circle,
  Trash2,
} from "lucide-react";
import { FontSizeType, TextALignType } from "@/lib/validation/text-schema";
import { OpacityFormField } from "@/components/forms/fields/opacity-form-field";
import { ImageSourceFormField } from "@/components/forms/fields/image-source-form-field";
import { ObjectFitType } from "@/lib/validation/image-schema";
import { ElementType } from "@/lib/validation/element-type";
import {
  TypographyFieldName,
  TypographyH3,
  TypographyH4,
  TypographyLarge,
} from "@/components/typography";
import { Separator } from "@/components/ui/separator";
import { Input } from "./ui/input";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { EmojiPicker } from "./emoji-picker";
import { Button } from "./ui/button";
import { useFieldArray } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { SwipeIndicatorForm } from "./forms/swipe-indicator-form";
import { useFormContext } from "react-hook-form";
import { IntroSlideStyle } from "./intro-slide-style-dialog";
import { useTextSelectionContext } from "@/lib/providers/text-selection-context";
import { TextFormattingForm } from "./forms/text-formatting-form";

const fontSizeMap: Record<FontSizeType, React.ReactElement> = {
  [FontSizeType.enum.Small]: <Type className="h-2 w-2" />,
  [FontSizeType.enum.Medium]: <Type className="h-3 w-3" />,
  [FontSizeType.enum.Large]: <Type className="h-4 w-4" />,
};

const textAlignMap: Record<TextALignType, React.ReactElement> = {
  [TextALignType.enum.Left]: <AlignLeft className="h-4 w-4" />,
  [TextALignType.enum.Center]: <AlignCenter className="h-4 w-4" />,
  [TextALignType.enum.Right]: <AlignRight className="h-4 w-4" />,
};

const objectFitMap: Record<ObjectFitType, React.ReactElement> = {
  [ObjectFitType.enum.Contain]: <Minimize2 className="h-4 w-4" />,
  [ObjectFitType.enum.Cover]: <Maximize2 className="h-4 w-4" />,
};

const shapeMap = {
  Circle: <Circle className="h-4 w-4" />,
  Square: <Square className="h-4 w-4" />,
  Rounded: <Square className="h-4 w-4 rounded-sm" />,
};

// Function to check if the selection is an element rather than a slide
const isElementSelection = (selection: string): boolean => {
  // Element paths have format like "slides.0.elements.1"
  // Slide paths have format like "slides.0"
  return selection.includes('.elements.');
};

// Function to check if the selection is a swipe indicator
const isSwipeIndicatorSelection = (selection: string, form: DocumentFormReturn): boolean => {
  // Selection is a path like "slides.0"
  if (!selection || selection.includes('.elements.')) {
    return false;
  }
  
  // Get the slide index from the path
  const slideMatch = selection.match(/slides\.(\d+)/);
  if (!slideMatch) {
    return false;
  }
  
  // Check if this is an intro slide by using getValues to check the slideStyle
  try {
    // Use a safer approach with type assertion
    const values = form.getValues();
    // Parse the path parts
    const parts = selection.split('.');
    if (parts.length === 2 && parts[0] === 'slides') {
      const slideIndex = parseInt(parts[1]);
      // Safely access the slideStyle
      const slideStyle = values.slides?.[slideIndex]?.slideStyle;
      
      const isIntroSlide = slideStyle === IntroSlideStyle.Classic || 
                          slideStyle === IntroSlideStyle.Emoji || 
                          slideStyle === IntroSlideStyle.Headshot;
      
      return isIntroSlide;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export function StyleMenu({
  form,
  className = "",
}: {
  form: DocumentFormReturn;
  className?: string;
}) {
  const { currentSelection: elementPath, setCurrentSelection } = useSelectionContext();
  const { currentTextSelection } = useTextSelectionContext();
  const stylePath = elementPath ? elementPath + ".style" : "";
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  
  // Get all form-related values and hooks upfront
  const { control } = form;
  let values;
  let style;
  let type;
  let elementsPath = "";
  let elementIndex = -1;
  let showDeleteButton = false;
  
  if (elementPath) {
    try {
      values = form.getValues(elementPath as ElementFieldPath);
      style = values?.style;
      type = values?.type;
      
      elementsPath = getParent(elementPath as string);
      elementIndex = getElementNumber(elementPath as string);
      showDeleteButton = isElementSelection(elementPath || "");
    } catch (error) {
      // Handle any errors silently
    }
  }
  
  // Initialize the field array hook regardless of conditions
  const { remove } = useFieldArray({
    control,
    name: (elementsPath || "slides") as any,
  });
  
  const handleDeleteElement = () => {
    remove(elementIndex);
    setCurrentSelection("", null);
    setDeleteDialogOpen(false);
  };
  
  if (!stylePath) {
    return <></>;
  }
  
  // Check if this is a swipe indicator selection
  if (isSwipeIndicatorSelection(elementPath || "", form)) {
    return (
      <div 
        className={cn("grid gap-4", className)}
        onClick={(event) => event.stopPropagation()}
      >
        <SwipeIndicatorForm />
      </div>
    );
  }

  // Check if we have text selected - show the text formatting form
  if (currentTextSelection) {
    return (
      <div
        className={cn("grid gap-4", className)}
        onClick={(event) => event.stopPropagation()}
      >
        <TextFormattingForm />
      </div>
    );
  }
  
  return (
    <div
      className={cn("grid gap-4", className)}
      onClick={
        // Don't propagate click to background
        (event) => event.stopPropagation()
      }
      key={elementPath}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <TypographyH3>Style</TypographyH3>
          {showDeleteButton && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Set the selected element style.
        </p>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Element</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this element? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteElement}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Separator orientation="horizontal"></Separator>
      <div className="flex flex-col gap-6 items-start">
        {style && Object.hasOwn(style, "fontSize") ? (
          <EnumRadioGroupField
            name="Font Size"
            form={form}
            fieldName={`${stylePath}.fontSize` as TextStyleFontSizeFieldPath}
            enumValueElements={fontSizeMap}
            groupClassName="grid grid-cols-3 gap-1"
            itemClassName="h-10 w-10"
          />
        ) : null}
        {style && Object.hasOwn(style, "align") ? (
          <EnumRadioGroupField
            name="Alignment"
            form={form}
            fieldName={`${stylePath}.align` as TextStyleAlignFieldPath}
            enumValueElements={textAlignMap}
            groupClassName="grid grid-cols-3 gap-1"
            itemClassName="h-10 w-10"
          />
        ) : null}
        {style && Object.hasOwn(style, "objectFit") ? (
          <EnumRadioGroupField
            name={"Object Fit"}
            form={form}
            fieldName={`${stylePath}.objectFit` as ImageStyleObjectFitFieldPath}
            enumValueElements={objectFitMap}
            groupClassName="grid grid-cols-3  gap-1"
            itemClassName="h-10 w-10"
          />
        ) : null}

        {/* Emoji Element Editing */}
        {type === ElementType.enum.Emoji && (
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <h4 className="text-base font-semibold">Emoji Settings</h4>
              <p className="text-sm text-muted-foreground">
                Customize the emoji display
              </p>
            </div>
            
            <FormField
              control={form.control}
              name={`${elementPath}.emoji` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji Character</FormLabel>
                  <div className="flex flex-row gap-2 items-end">
                    <FormControl>
                      <Input 
                        {...field} 
                        className="font-emoji text-2xl w-24 text-center"
                      />
                    </FormControl>
                    <EmojiPicker onEmojiSelect={(emoji) => field.onChange(emoji)} />
                  </div>
                </FormItem>
              )}
            />

            {/* Size Option */}
            <EnumRadioGroupField
              name="Size"
              form={form}
              fieldName={`${stylePath}.size` as any}
              enumValueElements={fontSizeMap}
              groupClassName="grid grid-cols-3 gap-1"
              itemClassName="h-10 w-10"
            />
            
            {/* Alignment Option */}
            <EnumRadioGroupField
              name="Alignment"
              form={form}
              fieldName={`${stylePath}.alignment` as any}
              enumValueElements={textAlignMap}
              groupClassName="grid grid-cols-3 gap-1"
              itemClassName="h-10 w-10"
            />
          </div>
        )}

        {/* Avatar Element Editing */}
        {type === ElementType.enum.Avatar && (
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <h4 className="text-base font-semibold">Avatar Settings</h4>
              <p className="text-sm text-muted-foreground">
                Customize the avatar display
              </p>
            </div>
            
            <div className="w-full space-y-2">
              <h4 className="text-sm font-medium">Upload Profile Picture</h4>
              <p className="text-xs text-muted-foreground mb-2">
                This will update your brand avatar across all slides
              </p>
              <ImageSourceFormField
                fieldName={"config.brand.avatar.source" as ImageSourceFieldPath}
                form={form}
              />
            </div>

            {/* Size Option */}
            <EnumRadioGroupField
              name="Size"
              form={form}
              fieldName={`${stylePath}.size` as any}
              enumValueElements={fontSizeMap}
              groupClassName="grid grid-cols-3 gap-1"
              itemClassName="h-10 w-10"
            />
            
            {/* Alignment Option */}
            <EnumRadioGroupField
              name="Alignment"
              form={form}
              fieldName={`${stylePath}.alignment` as any}
              enumValueElements={textAlignMap}
              groupClassName="grid grid-cols-3 gap-1"
              itemClassName="h-10 w-10"
            />

            {/* Shape Option */}
            <EnumRadioGroupField
              name="Shape"
              form={form}
              fieldName={`${stylePath}.shape` as any}
              enumValueElements={shapeMap}
              groupClassName="grid grid-cols-3 gap-1"
              itemClassName="h-10 w-10"
            />
          </div>
        )}

        {type == ElementType.enum.Image ||
        type == ElementType.enum.ContentImage ? (
          <>
            <div className="w-full flex flex-col gap-3">
              <h4 className="text-base font-semibold">Image</h4>
              <TypographyFieldName>Source</TypographyFieldName>
              <ImageSourceFormField
                fieldName={`${elementPath}.source` as ImageSourceFieldPath}
                form={form}
              />
            </div>
          </>
        ) : null}
        {style && Object.hasOwn(style, "opacity") ? (
          <>
            <OpacityFormField
              fieldName={`${stylePath}.opacity` as ImageStyleOpacityFieldPath}
              form={form}
              label={"Opacity"}
              className="w-full"
              disabled={
                form.getValues(
                  `${elementPath}.source.src` as ImageSourceSrcFieldPath
                ) == ""
              }
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

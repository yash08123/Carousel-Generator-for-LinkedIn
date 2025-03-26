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
  ImageIcon,
  Text,
  Command,
  ScrollText,
  ChevronRight,
  Image,
  FileText,
  LayoutTemplate,
  Monitor,
  UserCircle,
  SmilePlus,
} from "lucide-react";
import { FontSizeType, TextALignType } from "@/lib/validation/text-schema";
import { OpacityFormField } from "@/components/forms/fields/opacity-form-field";
import { ImageSourceFormField } from "@/components/forms/fields/image-source-form-field";
import { ObjectFitType, ImageInputType } from "@/lib/validation/image-schema";
import { ElementType } from "@/lib/validation/element-type";
import {
  TypographyFieldName,
  TypographyH3,
  TypographyH4,
  TypographyLarge,
} from "@/components/typography";
import { Separator } from "@/components/ui/separator";
import { Input } from "./ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormDescription } from "./ui/form";
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
import { Switch } from "@/components/ui/switch";
import { ContentSlideStyle } from "./content-slide-style-dialog";
import { OutroSlideStyle } from "./outro-slide-style-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DEFAULT_TITLE, DEFAULT_SUBTITLE, DEFAULT_DESCRIPTION } from "@/lib/validation/text-schema";
import { DEFAULT_CONTENT_IMAGE_INPUT } from "@/lib/validation/image-schema";

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

// Function to check if the selection is a text element
const isTextElement = (type: string | undefined): boolean => {
  return type === ElementType.enum.Title || 
         type === ElementType.enum.Subtitle || 
         type === ElementType.enum.Description;
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

// Function to check if the selection is a slide (not an element)
const isSlideSelection = (selection: string | null | undefined): boolean => {
  // Element paths have format like "slides.0.elements.1"
  // Slide paths have format like "slides.0"
  return !!selection && selection.startsWith('slides.') && !selection.includes('.elements.');
};

// Function to check if the selection is a content slide
const isContentSlide = (slideStyle?: string): boolean => {
  return slideStyle === ContentSlideStyle.Text || 
         slideStyle === ContentSlideStyle.TextImage || 
         slideStyle === ContentSlideStyle.Image || 
         slideStyle === ContentSlideStyle.Screenshot;
};

// Function to check if the selection is an intro slide
const isIntroSlideType = (slideStyle?: string): boolean => {
  return slideStyle === IntroSlideStyle.Classic || 
         slideStyle === IntroSlideStyle.Emoji || 
         slideStyle === IntroSlideStyle.Headshot;
};

// Function to check if the selection is an outro slide
const isOutroSlideType = (slideStyle?: string): boolean => {
  return slideStyle === OutroSlideStyle.Classic || 
         slideStyle === OutroSlideStyle.Headshot;
};

// Function to determine slide category based on style
const getSlideCategory = (slideStyle?: string): 'intro' | 'content' | 'outro' | 'unknown' => {
  if (isIntroSlideType(slideStyle)) return 'intro';
  if (isContentSlide(slideStyle)) return 'content';
  if (isOutroSlideType(slideStyle)) return 'outro';
  return 'unknown';
};

// Helper function to get the field path for a content image in a slide
const getContentImageFieldPath = (slideIndex: number, slideElements: any[]): string => {
  const imageIndex = slideElements.findIndex(el => el.type === ElementType.enum.ContentImage);
  if (imageIndex >= 0) {
    return `slides.${slideIndex}.elements.${imageIndex}.source`;
  }
  return `slides.${slideIndex}.backgroundImage.source`;
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [aiPrompt, setAiPrompt] = React.useState("");
  
  // Get all form-related values and hooks upfront
  const { control } = form;
  let values;
  let style;
  let type;
  let elementsPath = "";
  let elementIndex = -1;
  
  // Default to showing delete button for any element path with '.elements.'
  let showDeleteButton = elementPath?.includes('.elements.') || false;
  
  if (elementPath) {
    try {
      values = form.getValues(elementPath as ElementFieldPath);
      style = values?.style;
      type = values?.type;
      
      // For element paths, extract the parent path and index
      if (elementPath.includes('.elements.')) {
        elementsPath = getParent(elementPath as string);
        elementIndex = getElementNumber(elementPath as string);
      }
    } catch (error) {
      console.error("Error in StyleMenu:", error);
    }
  }
  
  // Initialize the field array hook regardless of conditions
  const { remove } = useFieldArray({
    control,
    name: (elementsPath || "slides") as any,
  });
  
  const handleDeleteElement = () => {
    if (elementPath && elementPath.includes('.elements.') && elementIndex >= 0) {
      remove(elementIndex);
      setCurrentSelection("", null);
      setDeleteDialogOpen(false);
    }
  };
  
  if (!stylePath && !isSlideSelection(elementPath || "")) {
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
  
  // If we have a slide selected but not an element, show the elements toggle menu
  if (isSlideSelection(elementPath || "")) {
    // Get the slide index
    const slideIndex = parseInt(elementPath!.split('.')[1]);
    // Get the slide elements
    const slideElements = form.getValues(`slides.${slideIndex}.elements`) || [];
    
    // Extract the slide style to determine what elements should be available
    const slideStyle = form.getValues(`slides.${slideIndex}.slideStyle`);
    const slideCategory = getSlideCategory(slideStyle);
    
    return (
      <div
        className={cn("grid gap-4", className)}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Slide Type Section - shown for all slide types */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <TypographyH3>Slide Type</TypographyH3>
            <div className="text-xs text-muted-foreground">
              Slide #{slideIndex + 1}
            </div>
          </div>
          
          {/* Intro Slide Types */}
          {slideCategory === 'intro' && (
            <div className="w-full mb-6">
              <TabsList className="grid grid-cols-3 w-full mb-5 bg-background/20 border border-border/30 shadow-md rounded-lg p-1.5 gap-1.5" defaultValue={slideStyle}>
                <TabsTrigger 
                  value={IntroSlideStyle.Classic}
                  title="Classic"
                  onClick={() => {
                    // First, filter out slide-specific elements (emoji and avatar)
                    const filteredElements = slideElements.filter(el => 
                      el.type !== ElementType.enum.Emoji && el.type !== ElementType.enum.Avatar
                    );
                    
                    // Update slide style and elements
                    form.setValue(`slides.${slideIndex}.elements`, filteredElements);
                    form.setValue(`slides.${slideIndex}.slideStyle`, IntroSlideStyle.Classic);
                    form.setValue(`slides.${slideIndex}.showTitle`, true);
                    form.setValue(`slides.${slideIndex}.showTagline`, true);
                    form.setValue(`slides.${slideIndex}.showParagraph`, true);
                    form.setValue(`slides.${slideIndex}.showSwipeIndicator`, true);
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === IntroSlideStyle.Classic ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <FileText className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger 
                  value={IntroSlideStyle.Emoji}
                  title="Emoji"
                  onClick={() => {
                    // First, filter out slide-specific elements (avatar)
                    const filteredElements = slideElements.filter(el => 
                      el.type !== ElementType.enum.Avatar
                    );
                    
                    // Update slide style and appropriate toggles for Emoji Intro
                    form.setValue(`slides.${slideIndex}.elements`, filteredElements);
                    form.setValue(`slides.${slideIndex}.slideStyle`, IntroSlideStyle.Emoji);
                    form.setValue(`slides.${slideIndex}.showTitle`, true);
                    form.setValue(`slides.${slideIndex}.showTagline`, true);
                    form.setValue(`slides.${slideIndex}.showParagraph`, true);
                    form.setValue(`slides.${slideIndex}.showSwipeIndicator`, true);
                    
                    // Add an emoji element if not already present
                    const hasEmoji = filteredElements.some(el => el.type === ElementType.enum.Emoji);
                    if (!hasEmoji) {
                      const newElements = [...filteredElements];
                      // Add the emoji at the beginning
                      newElements.unshift({
                        type: ElementType.enum.Emoji,
                        emoji: "😊",
                        style: {
                          size: "Large",
                          alignment: "Center",
                        }
                      });
                      form.setValue(`slides.${slideIndex}.elements`, newElements);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === IntroSlideStyle.Emoji ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <SmilePlus className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger 
                  value={IntroSlideStyle.Headshot}
                  title="Headshot"
                  onClick={() => {
                    // First, filter out slide-specific elements (emoji)
                    const filteredElements = slideElements.filter(el => 
                      el.type !== ElementType.enum.Emoji
                    );
                    
                    // Update slide style and appropriate toggles for Headshot Intro
                    form.setValue(`slides.${slideIndex}.elements`, filteredElements);
                    form.setValue(`slides.${slideIndex}.slideStyle`, IntroSlideStyle.Headshot);
                    form.setValue(`slides.${slideIndex}.showTitle`, true);
                    form.setValue(`slides.${slideIndex}.showTagline`, true);
                    form.setValue(`slides.${slideIndex}.showParagraph`, true);
                    form.setValue(`slides.${slideIndex}.showSwipeIndicator`, true);
                    
                    // Add an avatar element if not already present
                    const hasAvatar = filteredElements.some(el => el.type === ElementType.enum.Avatar);
                    if (!hasAvatar) {
                      const newElements = [...filteredElements];
                      // Add the avatar at the beginning
                      newElements.unshift({
                        type: ElementType.enum.Avatar,
                        style: {
                          size: "Large",
                          alignment: "Center",
                          shape: "Circle"
                        }
                      });
                      form.setValue(`slides.${slideIndex}.elements`, newElements);
                      
                      // Make sure the brand avatar is set up in the config
                      const brandAvatar = form.getValues("config.brand.avatar");
                      if (!brandAvatar || !brandAvatar.source || !brandAvatar.source.src) {
                        form.setValue("config.brand.avatar.source", {
                          src: "https://placekitten.com/200/200",
                          type: ImageInputType.Url
                        });
                      }
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === IntroSlideStyle.Headshot ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <UserCircle className="h-5 w-5" />
                </TabsTrigger>
              </TabsList>
            </div>
          )}
          
          {/* Content Slide Types */}
          {slideCategory === 'content' && (
            <div className="w-full mb-6">
              <TabsList className="grid grid-cols-4 w-full mb-5 bg-background/20 border border-border/30 shadow-md rounded-lg p-1.5 gap-1.5" defaultValue={slideStyle}>
                <TabsTrigger 
                  value={ContentSlideStyle.Text}
                  title="Text"
                  onClick={() => {
                    // Update slide style and appropriate toggles for Text layout
                    form.setValue(`slides.${slideIndex}.slideStyle`, ContentSlideStyle.Text);
                    form.setValue(`slides.${slideIndex}.showTitle`, true);
                    form.setValue(`slides.${slideIndex}.showTagline`, true);
                    form.setValue(`slides.${slideIndex}.showParagraph`, true);
                    
                    // Ensure we have text elements but remove image elements
                    const filteredElements = slideElements.filter(el => 
                      el.type !== ElementType.enum.ContentImage && el.type !== ElementType.enum.Image
                    );
                    
                    // Add default text elements if needed
                    const hasTitle = filteredElements.some(el => el.type === ElementType.enum.Title);
                    const hasSubtitle = filteredElements.some(el => el.type === ElementType.enum.Subtitle);
                    const hasDescription = filteredElements.some(el => el.type === ElementType.enum.Description);
                    
                    let newElements = [...filteredElements];
                    
                    if (!hasTitle) {
                      newElements.push({ ...DEFAULT_TITLE });
                    }
                    
                    if (!hasSubtitle) {
                      newElements.push({ ...DEFAULT_SUBTITLE });
                    }
                    
                    if (!hasDescription) {
                      newElements.push({ ...DEFAULT_DESCRIPTION });
                    }
                    
                    form.setValue(`slides.${slideIndex}.elements`, newElements);
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === ContentSlideStyle.Text ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <FileText className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger 
                  value={ContentSlideStyle.TextImage}
                  title="Text+Image"
                  onClick={() => {
                    // Update slide style and appropriate toggles for Text+Image layout
                    form.setValue(`slides.${slideIndex}.slideStyle`, ContentSlideStyle.TextImage);
                    form.setValue(`slides.${slideIndex}.showTitle`, true);
                    form.setValue(`slides.${slideIndex}.showTagline`, true);
                    form.setValue(`slides.${slideIndex}.showParagraph`, false);
                    
                    // Filter elements but keep existing text elements
                    let newElements = slideElements.filter(el => 
                      el.type !== ElementType.enum.ContentImage && el.type !== ElementType.enum.Image
                    );
                    
                    // Add default text elements if needed
                    const hasTitle = newElements.some(el => el.type === ElementType.enum.Title);
                    const hasSubtitle = newElements.some(el => el.type === ElementType.enum.Subtitle);
                    
                    if (!hasTitle) {
                      newElements.push({ ...DEFAULT_TITLE });
                    }
                    
                    if (!hasSubtitle) {
                      newElements.push({ ...DEFAULT_SUBTITLE });
                    }
                    
                    // Add a ContentImage element
                    // @ts-ignore - Intentionally adding ContentImage element
                    newElements.push({ ...DEFAULT_CONTENT_IMAGE_INPUT });
                    
                    // Filter out any undefined values to ensure type safety
                    const filteredElements = newElements.filter(el => el !== undefined);
                    
                    form.setValue(`slides.${slideIndex}.elements`, filteredElements);
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === ContentSlideStyle.TextImage ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <LayoutTemplate className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger 
                  value={ContentSlideStyle.Image}
                  title="Image"
                  onClick={() => {
                    // Update slide style and appropriate toggles for Image-only layout
                    form.setValue(`slides.${slideIndex}.slideStyle`, ContentSlideStyle.Image);
                    form.setValue(`slides.${slideIndex}.showTitle`, false);
                    form.setValue(`slides.${slideIndex}.showTagline`, false);
                    form.setValue(`slides.${slideIndex}.showParagraph`, false);
                    
                    // Remove all elements except images
                    const hasContentImage = slideElements.some(el => el.type === ElementType.enum.ContentImage);
                    
                    if (hasContentImage) {
                      // Keep only the content image
                      const imageElements = slideElements.filter(el => el.type === ElementType.enum.ContentImage);
                      form.setValue(`slides.${slideIndex}.elements`, imageElements);
                    } else {
                      // Add a new content image
                      form.setValue(`slides.${slideIndex}.elements`, [{ ...DEFAULT_CONTENT_IMAGE_INPUT }]);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === ContentSlideStyle.Image ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <ImageIcon className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger 
                  value={ContentSlideStyle.Screenshot}
                  title="Screenshot"
                  onClick={() => {
                    // Update slide style and appropriate toggles for Screenshot layout
                    form.setValue(`slides.${slideIndex}.slideStyle`, ContentSlideStyle.Screenshot);
                    form.setValue(`slides.${slideIndex}.showTitle`, true);
                    form.setValue(`slides.${slideIndex}.showTagline`, false);
                    form.setValue(`slides.${slideIndex}.showParagraph`, false);
                    
                    // Filter to keep only title and content image
                    let newElements = [];
                    
                    // Keep existing title if present, otherwise add default
                    const existingTitle = slideElements.find(el => el.type === ElementType.enum.Title);
                    if (existingTitle) {
                      newElements.push(existingTitle);
                    } else {
                      newElements.push({ ...DEFAULT_TITLE });
                    }
                    
                    // Add content image if not already present
                    const hasContentImage = slideElements.some(el => el.type === ElementType.enum.ContentImage);
                    if (hasContentImage) {
                      const imageElement = slideElements.find(el => el.type === ElementType.enum.ContentImage);
                      if (imageElement) {
                        newElements.push(imageElement);
                      }
                    } else {
                      newElements.push({ ...DEFAULT_CONTENT_IMAGE_INPUT });
                    }
                    
                    // Filter out any undefined values to ensure type safety
                    const filteredElements = newElements.filter(el => el !== undefined);
                    
                    form.setValue(`slides.${slideIndex}.elements`, filteredElements);
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === ContentSlideStyle.Screenshot ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <Monitor className="h-5 w-5" />
                </TabsTrigger>
              </TabsList>
            </div>
          )}
          
          {/* Outro Slide Types */}
          {slideCategory === 'outro' && (
            <div className="w-full mb-6">
              <TabsList className="grid grid-cols-2 w-full mb-5 bg-background/20 border border-border/30 shadow-md rounded-lg p-1.5 gap-1.5" defaultValue={slideStyle}>
                <TabsTrigger 
                  value={OutroSlideStyle.Classic}
                  title="Classic"
                  onClick={() => {
                    // Filter out slide-specific elements (avatar)
                    const filteredElements = slideElements.filter(el => 
                      el.type !== ElementType.enum.Avatar
                    );
                    
                    // Update slide style and appropriate toggles for Classic Outro
                    form.setValue(`slides.${slideIndex}.elements`, filteredElements);
                    form.setValue(`slides.${slideIndex}.slideStyle`, OutroSlideStyle.Classic);
                    form.setValue(`slides.${slideIndex}.showTitle`, true);
                    form.setValue(`slides.${slideIndex}.showTagline`, true);
                    form.setValue(`slides.${slideIndex}.showParagraph`, true);
                    
                    // Make sure we have the necessary text elements
                    const hasTitle = filteredElements.some(el => el.type === ElementType.enum.Title);
                    const hasSubtitle = filteredElements.some(el => el.type === ElementType.enum.Subtitle);
                    const hasDescription = filteredElements.some(el => el.type === ElementType.enum.Description);
                    
                    let newElements = [...filteredElements];
                    
                    if (!hasTitle) {
                      newElements.push({ ...DEFAULT_TITLE });
                    }
                    
                    if (!hasSubtitle) {
                      newElements.push({ ...DEFAULT_SUBTITLE });
                    }
                    
                    if (!hasDescription) {
                      newElements.push({ ...DEFAULT_DESCRIPTION });
                    }
                    
                    form.setValue(`slides.${slideIndex}.elements`, newElements);
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === OutroSlideStyle.Classic ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <FileText className="h-5 w-5" />
                </TabsTrigger>
                <TabsTrigger 
                  value={OutroSlideStyle.Headshot}
                  title="Headshot"
                  onClick={() => {
                    // Filter out content-specific elements
                    let filteredElements = slideElements.filter(el => 
                      el.type !== ElementType.enum.Description
                    );
                    
                    // Update slide style and appropriate toggles for Headshot Outro
                    form.setValue(`slides.${slideIndex}.slideStyle`, OutroSlideStyle.Headshot);
                    form.setValue(`slides.${slideIndex}.showTitle`, true);
                    form.setValue(`slides.${slideIndex}.showTagline`, true);
                    form.setValue(`slides.${slideIndex}.showParagraph`, false);
                    
                    // Make sure we have the necessary text elements
                    const hasTitle = filteredElements.some(el => el.type === ElementType.enum.Title);
                    const hasSubtitle = filteredElements.some(el => el.type === ElementType.enum.Subtitle);
                    
                    let newElements = [...filteredElements];
                    
                    if (!hasTitle) {
                      newElements.push({ ...DEFAULT_TITLE });
                    }
                    
                    if (!hasSubtitle) {
                      newElements.push({ ...DEFAULT_SUBTITLE });
                    }
                    
                    // Add an avatar element if not already present
                    const hasAvatar = newElements.some(el => el.type === ElementType.enum.Avatar);
                    if (!hasAvatar) {
                      // Add the avatar at the beginning
                      newElements.unshift({
                        type: ElementType.enum.Avatar,
                        style: {
                          size: "Large", 
                          alignment: "Center",
                          shape: "Circle"
                        }
                      });
                    }
                    
                    form.setValue(`slides.${slideIndex}.elements`, newElements);
                    
                    // Make sure the brand avatar is set up in the config
                    const brandAvatar = form.getValues("config.brand.avatar");
                    if (!brandAvatar || !brandAvatar.source || !brandAvatar.source.src) {
                      form.setValue("config.brand.avatar.source", {
                        src: "https://placekitten.com/200/200",
                        type: ImageInputType.Url
                      });
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center p-2.5 aspect-square transition-all duration-200 rounded-md border border-transparent data-[state=active]:border-primary/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow hover:bg-muted/70",
                    slideStyle === OutroSlideStyle.Headshot ? "bg-primary text-primary-foreground shadow" : "bg-card/80"
                  )}
                >
                  <UserCircle className="h-5 w-5" />
                </TabsTrigger>
              </TabsList>
            </div>
          )}
          
          {/* For unknown slide types, provide a message */}
          {slideCategory === 'unknown' && (
            <div className="text-sm text-muted-foreground">
              This slide type does not have style variations.
            </div>
          )}
          
          <Separator className="my-2" />
        </div>

        {/* Image options for image-based slides - simplified */}
        {(slideStyle === ContentSlideStyle.Image || 
          slideStyle === ContentSlideStyle.Screenshot || 
          slideStyle === ContentSlideStyle.TextImage) && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium">Image</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center justify-center gap-1 h-10"
                onClick={() => {
                  // Handle horizontal alignment
                  if (slideElements.some(el => el.type === ElementType.enum.ContentImage)) {
                    // Set content image to horizontal alignment
                    const imageIndex = slideElements.findIndex(el => el.type === ElementType.enum.ContentImage);
                    if (imageIndex >= 0) {
                      form.setValue(`slides.${slideIndex}.elements.${imageIndex}.style.align`, TextALignType.enum.Center);
                    }
                  }
                }}
              >
                <LayoutTemplate className="h-4 w-4" />
                <span className="text-xs">Horizontal</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center justify-center gap-1 h-10"
                onClick={() => {
                  // Handle vertical alignment
                  if (slideElements.some(el => el.type === ElementType.enum.ContentImage)) {
                    // Set content image to vertical alignment
                    const imageIndex = slideElements.findIndex(el => el.type === ElementType.enum.ContentImage);
                    if (imageIndex >= 0) {
                      form.setValue(`slides.${slideIndex}.elements.${imageIndex}.style.align`, TextALignType.enum.Center);
                    }
                  }
                }}
              >
                <LayoutTemplate className="h-4 w-4 rotate-90" />
                <span className="text-xs">Vertical</span>
              </Button>
            </div>
            
            {/* Active Image Source Display */}
            {slideElements.some(el => el.type === ElementType.enum.ContentImage) && (
              <div className="border rounded-md p-2 flex justify-center items-center bg-muted/30 h-32 overflow-hidden">
                {(() => {
                  const imageIndex = slideElements.findIndex(el => el.type === ElementType.enum.ContentImage);
                  const imageSrc = imageIndex >= 0 
                    ? form.getValues(`slides.${slideIndex}.elements.${imageIndex}.source.src`) 
                    : '';
                    
                  return imageSrc 
                    ? <img 
                        src={imageSrc} 
                        alt="Current slide image" 
                        className="max-w-full max-h-full object-contain"
                      /> 
                    : <div className="text-sm text-muted-foreground flex flex-col items-center">
                        <ImageIcon className="h-6 w-6 mb-2" />
                        <span>No image selected</span>
                      </div>;
                })()}
              </div>
            )}
            
            {/* Simplified Image Source Section */}
            <div className="border rounded-md p-3">
              <h5 className="text-sm font-medium mb-3">Image Source</h5>
              <ImageSourceFormField
                fieldName={getContentImageFieldPath(slideIndex, slideElements) as ImageSourceFieldPath}
                form={form}
              />
            </div>
          </div>
        )}
        
        {/* Slide Elements Section */}
        <div className="space-y-2">
          <TypographyH3>Slide Elements</TypographyH3>
          <p className="text-sm text-muted-foreground">
            Toggle elements to show on this slide
          </p>
        </div>
        
        <Separator className="my-2" />
        
        {/* Tagline Toggle */}
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name={`slides.${slideIndex}.showTagline`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Command className="mr-2 h-4 w-4 text-primary" />
                    <FormLabel className="font-medium">Tagline</FormLabel>
                  </div>
                  <FormDescription className="text-xs">
                    A short, attention-grabbing phrase
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Title Toggle */}
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name={`slides.${slideIndex}.showTitle`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <Text className="mr-2 h-4 w-4 text-primary" />
                    <FormLabel className="font-medium">Title</FormLabel>
                  </div>
                  <FormDescription className="text-xs">
                    The main heading of your slide
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Paragraph Toggle */}
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name={`slides.${slideIndex}.showParagraph`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                <div className="space-y-0.5">
                  <div className="flex items-center">
                    <ScrollText className="mr-2 h-4 w-4 text-primary" />
                    <FormLabel className="font-medium">Paragraph</FormLabel>
                  </div>
                  <FormDescription className="text-xs">
                    Detailed text content for your slide
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Swipe Indicator Toggle - Only for intro slides */}
        {slideCategory === 'intro' && (
          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name={`slides.${slideIndex}.showSwipeIndicator`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                      <FormLabel className="font-medium">Swipe Indicator</FormLabel>
                    </div>
                    <FormDescription className="text-xs">
                      A visual cue to prompt swiping
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
        
        {/* Background Image Toggle */}
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name={`slides.${slideIndex}.showBackgroundImage`}
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-4 w-full">
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Image className="mr-2 h-4 w-4 text-primary" />
                      <FormLabel className="font-medium">Background Image</FormLabel>
                    </div>
                    <FormDescription className="text-xs">
                      An image displayed behind slide content
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                
                {/* Show image upload options when background image is enabled */}
                {field.value && (
                  <div className="ml-2 pl-4 border-l-2 border-primary/20 space-y-3">
                    <h4 className="text-sm font-medium">Background Image Source</h4>
                    <ImageSourceFormField
                      fieldName={`slides.${slideIndex}.backgroundImage.source` as ImageSourceFieldPath}
                      form={form}
                    />
                    <OpacityFormField
                      fieldName={`slides.${slideIndex}.backgroundImage.style.opacity` as ImageStyleOpacityFieldPath}
                      form={form}
                      label={"Opacity"}
                      className="w-full"
                    />
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
        
        <Separator className="my-2" />
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
              Are you sure you want to delete this {isTextElement(type) ? "text " : ""}element? This action cannot be undone.
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

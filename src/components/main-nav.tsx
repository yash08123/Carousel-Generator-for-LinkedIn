import * as React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "./ui/button";
import { EditorMenubar } from "./editor-menubar";
import { Download, Loader2Icon, Settings, Sparkles, RotateCcw, Undo, Redo, AlertTriangle } from "lucide-react";
import Pager from "./pager";
import { FilenameForm } from "./forms/filename-form";
import { BringYourKeysDialog } from "@/components/api-keys-dialog";
import { useFormContext } from "react-hook-form";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { useToast } from "./ui/use-toast";
import { ElementType } from "@/lib/validation/element-type";
import { pallettes } from "@/lib/pallettes";
import { fontsMap } from "@/lib/fonts-map";
import { ThemeToggle } from "./theme-toggle";
import { defaultValues } from "@/lib/default-document";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// Import enum from elements-schema.tsx for background elements
import { ElementType as BackgroundElementType } from "@/lib/validation/elements-schema";
import { TextALignType, VerticalAlignType, FontSizeType } from "@/lib/validation/text-schema";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MainNavItem = NavItem;

interface MainNavProps {
  handlePrint: () => void;
  isPrinting: boolean;
  className?: string;
}

export function MainNav({ handlePrint, isPrinting, className }: MainNavProps) {
  const form: DocumentFormReturn = useFormContext();
  const { setValue, reset, getValues } = form;
  const { toast } = useToast();
  const [undoStack, setUndoStack] = React.useState<any[]>([]);
  const [redoStack, setRedoStack] = React.useState<any[]>([]);
  const [currentState, setCurrentState] = React.useState<any>(form.getValues());

  // Track form changes to enable undo/redo
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      // Only add to undo stack if the state has actually changed
      if (JSON.stringify(value) !== JSON.stringify(currentState)) {
        setUndoStack((prev) => [...prev, currentState]);
        setRedoStack([]);
        // Use any type cast to avoid TypeScript issues
        setCurrentState(value as any);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, currentState]);

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      
      setRedoStack([...redoStack, currentState]);
      setUndoStack(newUndoStack);
      setCurrentState(previousState);
      // Use any type cast to avoid form value type issues
      reset(previousState as any);
      
      toast({
        title: "Action Undone",
        description: "Previous state has been restored.",
      });
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      
      setUndoStack([...undoStack, currentState]);
      setRedoStack(newRedoStack);
      setCurrentState(nextState);
      // Use any type cast to avoid form value type issues
      reset(nextState as any);
      
      toast({
        title: "Action Redone",
        description: "Change has been reapplied.",
      });
    }
  };

  const handleReset = () => {
    // Save current state to undo stack before resetting
    setUndoStack([...undoStack, currentState]);
    setRedoStack([]);
    
    // Reset form to default values
    reset(defaultValues as any);
    setCurrentState(defaultValues);
    
    toast({
      title: "Reset Complete",
      description: "All changes have been reset to default values.",
    });
  };

  const handleRandomize = () => {
    // Add current state to undo stack
    setUndoStack([...undoStack, currentState]);
    setRedoStack([]);

    // 1. Randomly select a color palette
    const paletteKeys = Object.keys(pallettes);
    const randomPaletteKey = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
    const colors = pallettes[randomPaletteKey];
    
    setValue("config.theme.pallette", randomPaletteKey);
    setValue("config.theme.primary", colors.primary);
    setValue("config.theme.secondary", colors.secondary);
    setValue("config.theme.background", colors.background);
    setValue("config.theme.isCustom", false);
    
    // 2. Randomly select and enable a background element
    const elementTypes = [
      BackgroundElementType.Gradient,
      BackgroundElementType.Grid,
      BackgroundElementType.Dots,
      BackgroundElementType.Waves,
      BackgroundElementType.Geometric
    ];
    const randomElementType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
    
    setValue("config.elements.enabled", true);
    setValue("config.elements.type", randomElementType);
    
    // Initialize properties based on the element type
    if (randomElementType === BackgroundElementType.Gradient) {
      const directions = ["to-r", "to-l", "to-t", "to-b", "to-tr", "to-tl", "to-br", "to-bl"] as const;
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      setValue("config.elements.gradient", {
        direction: randomDirection,
        opacity: Math.floor(Math.random() * 30) + 40, // Random opacity between 40-70%
      });
    } else if (randomElementType === BackgroundElementType.Grid) {
      const sizes = ["sm", "md", "lg"] as const;
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
      setValue("config.elements.grid", {
        size: randomSize,
        opacity: Math.floor(Math.random() * 30) + 40,
        color: "currentColor",
      });
    } else if (randomElementType === BackgroundElementType.Dots) {
      const sizes = ["sm", "md", "lg"] as const;
      const spacings = ["tight", "normal", "loose"] as const;
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
      const randomSpacing = spacings[Math.floor(Math.random() * spacings.length)];
      setValue("config.elements.dots", {
        size: randomSize,
        opacity: Math.floor(Math.random() * 30) + 40,
        spacing: randomSpacing,
      });
    } else if (randomElementType === BackgroundElementType.Waves) {
      const amplitudes = ["low", "medium", "high"] as const;
      const randomAmplitude = amplitudes[Math.floor(Math.random() * amplitudes.length)];
      setValue("config.elements.waves", {
        amplitude: randomAmplitude,
        opacity: Math.floor(Math.random() * 30) + 40,
      });
    } else if (randomElementType === BackgroundElementType.Geometric) {
      const patterns = ["triangles", "squares", "hexagons"] as const;
      const sizes = ["sm", "md", "lg"] as const;
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
      setValue("config.elements.geometric", {
        pattern: randomPattern,
        size: randomSize,
        opacity: Math.floor(Math.random() * 30) + 40,
      });
    }
    
    // 3. Randomly select fonts
    const fontKeys = Object.keys(fontsMap);
    const randomFont1Key = fontKeys[Math.floor(Math.random() * fontKeys.length)];
    
    // Make sure font2 is different from font1
    let randomFont2Key;
    do {
      randomFont2Key = fontKeys[Math.floor(Math.random() * fontKeys.length)];
    } while (randomFont2Key === randomFont1Key);
    
    setValue("config.fonts.font1", randomFont1Key);
    setValue("config.fonts.font2", randomFont2Key);
    
    // 4. Enhanced randomize text elements with improved visibility checks
    // Get current slides
    const slides = getValues("slides");
    if (slides && slides.length > 0) {
      slides.forEach((slide, slideIndex) => {
        // Count elements to determine best layout strategy
        let elementCount = 0;
        let hasTitle = false;
        let hasSubtitle = false;
        let hasDescription = false;
        let hasImage = false;
        let hasEmoji = false;
        let hasAvatar = false;
        let hasFooter = true; // Always consider footer as present
        let hasSwipeIndicator = false;
        let imageCount = 0;
        
        // Analyze slide content
        if (slide.elements && slide.elements.length > 0) {
          elementCount = slide.elements.length;
          
          // Check what elements exist on this slide
          slide.elements.forEach(element => {
            if (element.type === ElementType.enum.Title) hasTitle = true;
            if (element.type === ElementType.enum.Subtitle) hasSubtitle = true;
            if (element.type === ElementType.enum.Description) hasDescription = true;
            if (element.type === ElementType.enum.ContentImage) {
              hasImage = true;
              imageCount++;
            }
            if (element.type === ElementType.enum.Emoji) hasEmoji = true;
            if (element.type === ElementType.enum.Avatar) {
              hasAvatar = true;
              imageCount++;
            }
          });
          
          // Check if this is potentially an intro slide (likely to have swipe indicator)
          hasSwipeIndicator = slideIndex === 0 || slideIndex === 1;
        }
        
        // For very crowded slides (5+ elements), set a more structured layout
        if (elementCount >= 5) {
          // Force top-to-bottom layout with left alignment for consistency
          let preferredHorizontalAlign = TextALignType.enum.Left;
          
          // Space elements evenly from top to bottom
          let position = 0;
          const totalElements = slide.elements.length;
          
          // Assign positions systematically to ensure visibility
          slide.elements.forEach((element, elementIndex) => {
            // Calculate relative position (0 = top, 1 = bottom)
            const relativePosition = position / (totalElements - 1);
            position++;
            
            // Apply position based on element type and relative position
            if (element.type === ElementType.enum.Title) {
              // Titles always at the top
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, "Top" as any);
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, preferredHorizontalAlign);
              // Use medium font size for dense slides
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.fontSize`, FontSizeType.enum.Medium);
            }
            else if (element.type === ElementType.enum.Subtitle) {
              // Subtitles near the top, just after title
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, "Top" as any);
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, preferredHorizontalAlign);
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.fontSize`, FontSizeType.enum.Medium);
            }
            else if (element.type === ElementType.enum.Description) {
              // Descriptions in the middle
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, "Middle" as any);
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, preferredHorizontalAlign);
              // Use smaller font for descriptions in crowded slides
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.fontSize`, FontSizeType.enum.Small);
            }
            else if (element.type === ElementType.enum.ContentImage || 
                     element.type === ElementType.enum.Avatar) {
              // Images in the middle-bottom area
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, 
                relativePosition < 0.7 ? "Middle" as any : "Bottom" as any);
              // Center images horizontally
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, TextALignType.enum.Center);
            }
            else if (element.type === ElementType.enum.Emoji) {
              // Emojis are more flexible, can go anywhere
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, 
                relativePosition < 0.3 ? "Top" as any : 
                relativePosition < 0.7 ? "Middle" as any : "Bottom" as any);
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, TextALignType.enum.Center);
            }
          });
          
          // Skip the rest of the normal positioning logic for very crowded slides
          return;
        }
        
        // Determine layout complexity
        const isComplexLayout = elementCount >= 3 || imageCount > 1;
        const isCrowded = elementCount >= 4;
        
        // Preferred horizontal alignment based on element count and types
        let preferredHorizontalAlign: TextALignType = TextALignType.enum.Center;
        
        // For complex layouts with many elements, bias toward left alignment for better readability
        if (isComplexLayout) {
          preferredHorizontalAlign = Math.random() < 0.7 ? TextALignType.enum.Left : TextALignType.enum.Center;
        }
        
        // For intro or title-only slides, center alignment looks better
        if (slideIndex === 0 || elementCount <= 2) {
          preferredHorizontalAlign = TextALignType.enum.Center;
        }
        
        // For slides with avatar or emoji, ensure we always center these elements
        if (hasAvatar || hasEmoji) {
          preferredHorizontalAlign = TextALignType.enum.Center;
        }
        
        // Decide on vertical distribution strategy based on content
        // For slides with many elements, distribute them more evenly
        
        // Apply specific layout strategies based on slide content
        let titlePosition: VerticalAlignType = VerticalAlignType.enum.Top;
        let subtitlePosition: VerticalAlignType = VerticalAlignType.enum.Top;
        let descriptionPosition: VerticalAlignType = VerticalAlignType.enum.Middle;
        let imagePosition: VerticalAlignType = VerticalAlignType.enum.Middle;
        let emojiPosition: VerticalAlignType = VerticalAlignType.enum.Middle;
        let avatarPosition: VerticalAlignType = VerticalAlignType.enum.Middle;
        
        // First/intro slide strategy
        if (slideIndex === 0) {
          // Intro slide - center title and subtitle vertically
          titlePosition = VerticalAlignType.enum.Middle;
          subtitlePosition = VerticalAlignType.enum.Middle;
          imagePosition = VerticalAlignType.enum.Bottom; // Put image at bottom if present
          emojiPosition = VerticalAlignType.enum.Top; // Put emoji at top if present
          avatarPosition = VerticalAlignType.enum.Top; // Avatar at top for intro slides
        } 
        // Minimal content (1-2 elements) strategy - center everything
        else if (elementCount <= 2) {
          titlePosition = VerticalAlignType.enum.Middle;
          subtitlePosition = VerticalAlignType.enum.Middle;
          descriptionPosition = VerticalAlignType.enum.Middle;
          imagePosition = VerticalAlignType.enum.Middle;
          emojiPosition = VerticalAlignType.enum.Middle;
          avatarPosition = VerticalAlignType.enum.Middle;
        }
        // Title + Image strategy
        else if (hasTitle && hasImage && !hasDescription) {
          titlePosition = VerticalAlignType.enum.Top;
          subtitlePosition = VerticalAlignType.enum.Top;
          imagePosition = VerticalAlignType.enum.Middle;
        }
        // Title + Description strategy
        else if (hasTitle && hasDescription && !hasImage) {
          titlePosition = VerticalAlignType.enum.Top;
          subtitlePosition = VerticalAlignType.enum.Top;
          descriptionPosition = VerticalAlignType.enum.Middle;
        }
        // Title + Subtitle + Description strategy
        else if (hasTitle && hasSubtitle && hasDescription) {
          titlePosition = VerticalAlignType.enum.Top;
          subtitlePosition = VerticalAlignType.enum.Top;
          descriptionPosition = VerticalAlignType.enum.Middle;
        }
        // Title + Subtitle + Image strategy
        else if (hasTitle && hasSubtitle && hasImage) {
          titlePosition = VerticalAlignType.enum.Top;
          subtitlePosition = VerticalAlignType.enum.Top;
          imagePosition = VerticalAlignType.enum.Middle;
        }
        // Complex layout with many elements - evenly distribute
        else if (isCrowded) {
          titlePosition = VerticalAlignType.enum.Top;
          subtitlePosition = VerticalAlignType.enum.Top;
          descriptionPosition = VerticalAlignType.enum.Middle;
          imagePosition = VerticalAlignType.enum.Middle;
          emojiPosition = VerticalAlignType.enum.Bottom;
          avatarPosition = VerticalAlignType.enum.Top;
        }
        
        // Always adjust avatar to better position for visibility
        if (hasAvatar) {
          // For headshot slides, position avatar prominently
          avatarPosition = hasTitle ? VerticalAlignType.enum.Middle : VerticalAlignType.enum.Top;
        }
        
        // Adjust for swipe indicator to avoid overlap
        if (hasSwipeIndicator) {
          // Never put descriptions at the bottom with swipe indicators
          if (descriptionPosition === "Bottom" as any) {
            descriptionPosition = "Middle" as any;
          }
          // Ensure images don't overlap with swipe indicator
          if (imagePosition === "Bottom" as any) {
            imagePosition = "Middle" as any;
          }
        }
        
        // Apply positions to elements
        if (slide.elements) {
          slide.elements.forEach((element, elementIndex) => {
            const elementType = element.type;
            
            // Apply specific positioning based on element type
            if (elementType === ElementType.enum.Title) {
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, titlePosition);
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, preferredHorizontalAlign);
              
              // For crowded slides, ensure title is concise with consistent size
              if (isCrowded) {
                setValue(`slides.${slideIndex}.elements.${elementIndex}.style.fontSize`, FontSizeType.enum.Medium);
              } else {
                // Otherwise, occasionally use a larger size for emphasis (30% chance)
                if (Math.random() < 0.3) {
                  setValue(`slides.${slideIndex}.elements.${elementIndex}.style.fontSize`, FontSizeType.enum.Large);
                } else {
                  setValue(`slides.${slideIndex}.elements.${elementIndex}.style.fontSize`, FontSizeType.enum.Medium);
                }
              }
            } 
            else if (elementType === ElementType.enum.Subtitle) {
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, subtitlePosition);
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, preferredHorizontalAlign);
              
              // Keep subtitles at a consistent size
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.fontSize`, FontSizeType.enum.Medium);
            }
            else if (elementType === ElementType.enum.Description) {
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, descriptionPosition);
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, preferredHorizontalAlign);
              
              // Descriptions typically look better at a smaller size when there's lots of content
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.fontSize`, 
                isCrowded ? FontSizeType.enum.Small : FontSizeType.enum.Medium);
            }
            else if (elementType === ElementType.enum.ContentImage) {
              // Images have different layout considerations
              // We can't directly set vertical-align on images, but we can adjust their containers
              // via element wrapper classes if needed
              
              // Try to apply any specific image styling via any available properties
              if (element.style) {
                setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, imagePosition);
              }
            }
            else if (elementType === ElementType.enum.Emoji) {
              // Center emojis horizontally for better aesthetics
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, TextALignType.enum.Center);
              
              // Position emoji based on layout strategy
              if (element.style) {
                setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, emojiPosition);
              }
            }
            else if (elementType === ElementType.enum.Avatar) {
              // Center avatars horizontally
              setValue(`slides.${slideIndex}.elements.${elementIndex}.style.align`, TextALignType.enum.Center);
              
              // Position avatar based on layout strategy
              if (element.style) {
                setValue(`slides.${slideIndex}.elements.${elementIndex}.style.verticalAlign`, avatarPosition);
              }
            }
          });
        }
      });
    }
    
    // Save the new state
    setCurrentState(form.getValues());
    
    // Show toast notification
    toast({
      title: "Design Randomized!",
      description: "New palette, fonts, and layout applied to your carousel.",
    });
  };

  return (
    <div
      className={cn(
        "flex gap-4 md:gap-10 justify-between items-center",
        className
      )}
    >
      <div className="flex gap-4">
        <Link href="/" className="items-center space-x-2 flex">
          <Icons.logo />
          <span className="hidden font-bold md:inline-block">
            AI Carousel Generator For LinkedIn
          </span>
        </Link>
        <EditorMenubar />
      </div>
      <div className="hidden lg:block">
        <Pager />
      </div>
      <div className="flex gap-2 items-center">
        <div className="hidden md:block">
          <FilenameForm />
        </div>
        
        <div className="flex gap-1 border-r pr-2 mr-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleUndo} 
            disabled={undoStack.length === 0}
            title="Undo"
            className="opacity-75 hover:opacity-100 transition-opacity"
          >
            <Undo className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo"
            className="opacity-75 hover:opacity-100 transition-opacity"
          >
            <Redo className="w-4 h-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                title="Reset All Changes" 
                className="text-destructive opacity-75 hover:opacity-100 transition-opacity"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your changes and return the carousel to its default state.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <ThemeToggle />
        
        <Button variant="ghost" size={"icon"} onClick={handlePrint}>
          <div className="flex flex-row gap-1 items-center">
            {isPrinting ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <Download />
            )}
          </div>
        </Button>

        <Button variant="ghost" size={"icon"} onClick={handleRandomize} title="Randomize Design">
          <div className="flex flex-row gap-1 items-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </Button>

        {/* // TODO: Re-enable your own keys system  */}
        {/* <BringYourKeysDialog
          triggerButton={
            <Button variant="ghost" size={"icon"}>
              <div className="flex flex-row gap-1 items-center">
                <Settings />
              </div>
            </Button>
          }
        /> */}
      </div>
    </div>
  );
}


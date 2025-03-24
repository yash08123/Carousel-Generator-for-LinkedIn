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
import { ElementType } from "@/lib/validation/elements-schema";
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
  const { setValue, reset } = form;
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
      ElementType.Gradient,
      ElementType.Grid,
      ElementType.Dots,
      ElementType.Waves,
      ElementType.Geometric
    ];
    const randomElementType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
    
    setValue("config.elements.enabled", true);
    setValue("config.elements.type", randomElementType);
    
    // Initialize properties based on the element type
    if (randomElementType === ElementType.Gradient) {
      const directions = ["to-r", "to-l", "to-t", "to-b", "to-tr", "to-tl", "to-br", "to-bl"] as const;
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      setValue("config.elements.gradient", {
        direction: randomDirection,
        opacity: Math.floor(Math.random() * 30) + 40, // Random opacity between 40-70%
      });
    } else if (randomElementType === ElementType.Grid) {
      const sizes = ["sm", "md", "lg"] as const;
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
      setValue("config.elements.grid", {
        size: randomSize,
        opacity: Math.floor(Math.random() * 30) + 40,
        color: "currentColor",
      });
    } else if (randomElementType === ElementType.Dots) {
      const sizes = ["sm", "md", "lg"] as const;
      const spacings = ["tight", "normal", "loose"] as const;
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
      const randomSpacing = spacings[Math.floor(Math.random() * spacings.length)];
      setValue("config.elements.dots", {
        size: randomSize,
        opacity: Math.floor(Math.random() * 30) + 40,
        spacing: randomSpacing,
      });
    } else if (randomElementType === ElementType.Waves) {
      const amplitudes = ["low", "medium", "high"] as const;
      const randomAmplitude = amplitudes[Math.floor(Math.random() * amplitudes.length)];
      setValue("config.elements.waves", {
        amplitude: randomAmplitude,
        opacity: Math.floor(Math.random() * 30) + 40,
      });
    } else if (randomElementType === ElementType.Geometric) {
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
    
    // Save the new state
    setCurrentState(form.getValues());
    
    // Show toast notification
    toast({
      title: "Design Randomized!",
      description: "New palette, background element, and fonts applied.",
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

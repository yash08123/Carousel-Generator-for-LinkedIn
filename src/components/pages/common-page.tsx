import React, { useState } from "react";
import * as z from "zod";
import { ConfigSchema } from "@/lib/validation/document-schema";
import Footer from "../elements/footer";
import { cn } from "@/lib/utils";
import { CommonSlideSchema } from "@/lib/validation/slide-schema";
import { BackgroundLayer } from "@/components/elements/background-layer";
import { BackgroundImageLayer } from "@/components/elements/background-image-layer";
import { BackgroundElementsLayer } from "@/components/elements/background-elements-layer";
import { PageBase } from "@/components/pages/page-base";
import { Title } from "@/components/elements/title";
import { Subtitle } from "@/components/elements/subtitle";
import { Description } from "@/components/elements/description";
import {
  ElementArrayFieldPath,
  ElementFieldPath,
  SlideFieldPath,
  TextFieldPath,
} from "@/lib/document-form-types";
import { PageFrame } from "@/components/pages/page-frame";
import { PageLayout } from "@/components/pages/page-layout";
import { AddElement } from "@/components/pages/add-element";
import { ElementType } from "@/lib/validation/element-type";
import { ContentImage } from "@/components/elements/content-image";
import { Emoji } from "@/components/elements/emoji";
import { Avatar } from "@/components/elements/avatar";
import { SwipeIndicator } from "@/components/elements/swipe-indicator";
import ElementMenubarWrapper from "@/components/element-menubar-wrapper";
import { useElementSize } from "usehooks-ts";
import { IntroSlideStyle } from "@/components/intro-slide-style-dialog";
import { ContentSlideStyle } from "@/components/content-slide-style-dialog";

export function CommonPage({
  index,
  config,
  slide,
  size,
  fieldName,
  className,
}: {
  index: number;
  config: z.infer<typeof ConfigSchema>;
  slide: z.infer<typeof CommonSlideSchema>;
  size: { width: number; height: number };
  fieldName: SlideFieldPath;
  className?: string;
}) {
  const LAYOUT_GAP = 8;
  const FRAME_PADDING = 40;
  const backgroundImageField = fieldName + ".backgroundImage";
  const [elementsHeight, setElementsHeight] = useState<number | null>(null);
  const [footerRef, footerDimensions] = useElementSize();
  const inputRefs = React.useRef<HTMLDivElement[]>([]);
  const offsetHeights = inputRefs.current.map((ref) => ref.offsetHeight);

  // Check if this is an intro slide (to display swipe indicator)
  // Intro slides have slideStyle that matches one of the IntroSlideStyle values
  const isIntroSlide = slide.slideStyle === IntroSlideStyle.Classic ||
                        slide.slideStyle === IntroSlideStyle.Emoji ||
                        slide.slideStyle === IntroSlideStyle.Headshot;
                        
  // Check if this is a headshot slide
  const isHeadshotSlide = slide.slideStyle === IntroSlideStyle.Headshot || 
                          slide.slideStyle === "OutroHeadshot";
                        
  // Get content slide style
  const contentSlideStyle = slide.slideStyle as ContentSlideStyle | undefined;

  React.useEffect(
    () => {
      const elementsHeights = inputRefs.current
        .filter((ref) => ref)
        .map((ref) => ref.offsetHeight);
      // Gap between existent elements + 1 for the element to be introduced by add button
      const gapHeights = elementsHeights.length * LAYOUT_GAP;
      setElementsHeight(
        elementsHeights.reduce((acc, el) => acc + el, 0) + gapHeights
      );
    },
    [offsetHeights]
    // TODO ADD dependencies
  );
  
  // Calculate the available space for elements
  const footerHeight = footerDimensions.height || 0;
  const totalPadding = FRAME_PADDING * 2;
  const maxAvailableHeight = size.height - totalPadding - footerHeight;
  
  const remainingHeight = elementsHeight
    ? Math.max(0, maxAvailableHeight - elementsHeight)
    : 0;

  // Custom layout classes based on content slide style
  const getLayoutClasses = () => {
    if (contentSlideStyle === ContentSlideStyle.Text) {
      return "flex flex-col items-center justify-center text-center";
    } else if (contentSlideStyle === ContentSlideStyle.Image) {
      return "flex flex-col items-center justify-center h-full";
    } else if (contentSlideStyle === ContentSlideStyle.Screenshot) {
      return "flex flex-col gap-4";
    } else if (isHeadshotSlide) {
      return "flex flex-col items-center justify-between gap-4";
    } else {
      // Default layout for Text+Image (make sure title and image have good spacing)
      return "flex flex-col items-center justify-between gap-6 h-full"; 
    }
  };

  // Determine if we should show the "Add Element" button based on slide style
  const shouldShowAddElement = () => {
    // For some styles, we don't want users adding arbitrary elements
    if (contentSlideStyle === ContentSlideStyle.Image) {
      return false;
    }
    
    // Don't show add element if there's not enough space
    if (remainingHeight < 50) {
      return false;
    }
    
    // Limit the number of elements on headshot slides to prevent overflow
    if (isHeadshotSlide && slide.elements.length >= 4) {
      return false;
    }
    
    return true;
  };
  
  // Apply specific styles to elements based on slide type
  const getElementStyle = (element: any, index: number) => {
    if (contentSlideStyle === ContentSlideStyle.Screenshot && 
        element.type === ElementType.enum.ContentImage) {
      return "p-4 border rounded-md shadow-md bg-muted/20";
    }
    
    if (contentSlideStyle === ContentSlideStyle.Image && 
        element.type === ElementType.enum.ContentImage) {
      return "max-h-[90%] flex-1 w-full";
    }
    
    // For Text+Image slides (which is the default), make title more prominent and image larger
    if (!contentSlideStyle && element.type === ElementType.enum.Title) {
      return "text-center w-full mb-4 max-w-[90%]";
    }
    
    if (!contentSlideStyle && element.type === ElementType.enum.ContentImage) {
      return "max-h-[70%] w-full flex-1";
    }
    
    if (isHeadshotSlide && element.type === ElementType.enum.Avatar) {
      return "max-w-[70%] max-h-[50%] overflow-hidden"; 
    }
    
    if (element.type === ElementType.enum.Emoji) {
      return "max-w-full overflow-hidden";
    }
    
    return "";
  };

  // Filter out elements based on slide style to prevent overcrowding
  const filteredElements = React.useMemo(() => {
    // For Image slides, only keep images (remove titles, descriptions, etc.)
    if (contentSlideStyle === ContentSlideStyle.Image) {
      return slide.elements.filter(element => 
        element.type === ElementType.enum.ContentImage
      );
    }
    
    // For Text+Image slides (default), remove descriptions
    if (!contentSlideStyle || contentSlideStyle === undefined) {
      return slide.elements.filter(element => 
        element.type !== ElementType.enum.Description
      );
    }
    
    // For Screenshot slides, remove descriptions
    if (contentSlideStyle === ContentSlideStyle.Screenshot) {
      return slide.elements.filter(element => 
        element.type !== ElementType.enum.Description
      );
    }
    
    // For all other slide types, keep all elements
    return slide.elements;
  }, [slide.elements, contentSlideStyle]);

  return (
    <PageBase size={size} fieldName={backgroundImageField}>
      <BackgroundLayer background={config.theme.background} className="-z-30" />
      {config.elements && config.elements.enabled && (
        <BackgroundElementsLayer 
          elements={config.elements} 
          className="-z-20"
          primaryColor={config.theme.primary}
          secondaryColor={config.theme.secondary}
        />
      )}
      {slide.backgroundImage?.source.src ? (
        <BackgroundImageLayer image={slide.backgroundImage} className="-z-10" />
      ) : null}
      <PageFrame
        fieldName={backgroundImageField}
        className={cn("p-10", className)}
      >
        <PageLayout fieldName={backgroundImageField} className={cn(getLayoutClasses(), "max-h-[calc(100%-2rem)] overflow-hidden")}>
          {filteredElements.map((element, index) => {
            // Use the actual index from the original slide.elements array to maintain correct field paths
            const originalIndex = slide.elements.findIndex(e => e === element);
            const currentField = (fieldName +
              ".elements." +
              originalIndex) as ElementFieldPath;
            
            return element.type == ElementType.enum.Title ? (
              <ElementMenubarWrapper
                key={currentField}
                fieldName={currentField}
                ref={(el) => {
                  el ? (inputRefs.current[index] = el) : null;
                }}
                className={getElementStyle(element, index)}
              >
                <Title fieldName={currentField as TextFieldPath} />
              </ElementMenubarWrapper>
            ) : element.type == ElementType.enum.Subtitle ? (
              <ElementMenubarWrapper
                key={currentField}
                fieldName={currentField}
                ref={(el) => {
                  el ? (inputRefs.current[index] = el) : null;
                }}
                className={getElementStyle(element, index)}
              >
                <Subtitle fieldName={currentField as TextFieldPath} />
              </ElementMenubarWrapper>
            ) : element.type == ElementType.enum.Description ? (
              <ElementMenubarWrapper
                key={currentField}
                fieldName={currentField}
                ref={(el) => {
                  el ? (inputRefs.current[index] = el) : null;
                }}
                className={getElementStyle(element, index)}
              >
                <Description fieldName={currentField as TextFieldPath} />
              </ElementMenubarWrapper>
            ) : element.type == ElementType.enum.ContentImage ? (
              <ElementMenubarWrapper
                key={currentField}
                fieldName={currentField}
                ref={(el) => {
                  el ? (inputRefs.current[index] = el) : null;
                }}
                className={getElementStyle(element, index)}
              >
                <ContentImage
                  fieldName={currentField as ElementFieldPath}
                  className={
                    contentSlideStyle === ContentSlideStyle.Image 
                      ? "h-[85%]" 
                      : contentSlideStyle === ContentSlideStyle.Screenshot
                        ? "h-[60%]"
                        : "h-[65%]"
                  }
                />
              </ElementMenubarWrapper>
            ) : element.type == ElementType.enum.Emoji ? (
              <ElementMenubarWrapper
                key={currentField}
                fieldName={currentField}
                ref={(el) => {
                  el ? (inputRefs.current[index] = el) : null;
                }}
                className={getElementStyle(element, index)}
              >
                <Emoji
                  fieldName={currentField as ElementFieldPath}
                />
              </ElementMenubarWrapper>
            ) : element.type == ElementType.enum.Avatar ? (
              <ElementMenubarWrapper
                key={currentField}
                fieldName={currentField}
                ref={(el) => {
                  el ? (inputRefs.current[index] = el) : null;
                }}
                className={getElementStyle(element, index)}
              >
                <Avatar
                  fieldName={currentField as ElementFieldPath}
                />
              </ElementMenubarWrapper>
            ) : null;
          })}
          {/* // TODO Replace 50 by the element size of element to introduce or minimum of all elements */}
          {shouldShowAddElement() ? (
            <AddElement
              fieldName={(fieldName + ".elements") as ElementArrayFieldPath}
            />
          ) : null}
          
          {/* Add Swipe Indicator for Intro slides */}
          {isIntroSlide && (
            <SwipeIndicator 
              fieldName={fieldName} 
              index={index}
            />
          )}
        </PageLayout>
        <Footer number={index + 1} config={config} ref={footerRef} />
      </PageFrame>
    </PageBase>
  );
}

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
  const remainingHeight = elementsHeight
    ? size.height - FRAME_PADDING * 2 - (footerDimensions.height || 0) - elementsHeight
    : 0;

  // Custom layout classes based on content slide style
  const getLayoutClasses = () => {
    if (contentSlideStyle === ContentSlideStyle.Text) {
      return "flex flex-col items-center justify-center text-center";
    } else if (contentSlideStyle === ContentSlideStyle.Image) {
      return "flex flex-col items-center";
    } else if (contentSlideStyle === ContentSlideStyle.Screenshot) {
      return "flex flex-col gap-4";
    } else {
      return "gap-2"; // Default layout
    }
  };

  // Determine if we should show the "Add Element" button based on slide style
  const shouldShowAddElement = () => {
    // For some styles, we don't want users adding arbitrary elements
    if (contentSlideStyle === ContentSlideStyle.Image) {
      return false;
    }
    
    return remainingHeight && remainingHeight >= 50;
  };
  
  // Apply specific styles to elements based on slide type
  const getElementStyle = (element: any, index: number) => {
    if (contentSlideStyle === ContentSlideStyle.Screenshot && 
        element.type === ElementType.enum.ContentImage) {
      return "p-4 border rounded-md shadow-md bg-muted/20";
    }
    
    if (contentSlideStyle === ContentSlideStyle.Image && 
        element.type === ElementType.enum.ContentImage) {
      return "max-h-[70%] flex-1";
    }
    
    return "";
  };

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
        <PageLayout fieldName={backgroundImageField} className={getLayoutClasses()}>
          {slide.elements.map((element, index) => {
            const currentField = (fieldName +
              ".elements." +
              index) as ElementFieldPath;
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
                  className={contentSlideStyle === ContentSlideStyle.Image ? "h-80" : "h-40"}
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

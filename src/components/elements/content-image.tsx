/* eslint-disable @next/next/no-img-element */
import React from "react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {
  ObjectFitType,
  ImageSchema,
  ContentImageSchema,
} from "@/lib/validation/image-schema";
import { useSelectionContext } from "@/lib/providers/selection-context";
import { getSlideNumber } from "@/lib/field-path";
import { usePagerContext } from "@/lib/providers/pager-context";
import { useFormContext } from "react-hook-form";
import {
  DocumentFormReturn,
  ElementFieldPath,
} from "@/lib/document-form-types";
import { ContentSlideStyle } from "@/components/content-slide-style-dialog";

export function ContentImage({
  fieldName,
  className,
}: {
  fieldName: ElementFieldPath;
  className?: string;
}) {
  const { register } = useFormContext();
  const { currentSelection, setCurrentSelection } = useSelectionContext();
  const isSelected = currentSelection === fieldName;

  // Get slide path from fieldName (slides.0.elements.1 -> slides.0)
  const slidePath = fieldName.split('.elements.')[0];
  // Get slideStyle to check if this is a Screenshot type
  const { getValues } = useFormContext();
  const slideStyle = getValues(`${slidePath}.slideStyle`) as string | undefined;
  const isScreenshot = slideStyle === ContentSlideStyle.Screenshot;

  const { setCurrentPage } = usePagerContext();
  const pageNumber = getSlideNumber(fieldName);
  const source = getValues(`${fieldName}.source.src`) || "https://placehold.co/400x200";
  
  // Check the slide style to apply special sizing/layout
  const isImageOnlySlide = slideStyle === "Image";
  
  // Get all elements in this slide to determine if this is the only element
  const slideElements = getValues(`${slidePath}.elements`);
  const isOnlyElement = slideElements?.length === 1;

  return (
    <div
      id={"content-image-" + fieldName}
      className={cn(
        "flex flex-col w-full outline-transparent rounded-md ring-offset-background relative",
        currentSelection == fieldName &&
          "outline-input ring-2 ring-offset-2 ring-ring",
        isImageOnlySlide && "h-full flex-1",
        className
      )}
      style={{
        maxHeight: isImageOnlySlide || isOnlyElement ? "90%" : "100%", 
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={(event) => {
        event.stopPropagation();
        setCurrentPage(pageNumber);
        setCurrentSelection(fieldName, event);
      }}
    >
      {isScreenshot ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-[95%] max-w-full">
            {/* Device frame header */}
            <div className="bg-gray-800 rounded-t-lg p-2 flex items-center space-x-1.5 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1 flex justify-center">
                <div className="w-1/2 h-4 bg-gray-700 rounded-md"></div>
              </div>
            </div>
            
            {/* Actual image with a subtle inner shadow to make it look embedded */}
            <div className="relative overflow-hidden rounded-b-lg border-x border-b border-gray-700 bg-white shadow-inner">
              <img
                {...register(`${fieldName}.source.src` as any)}
                src={source}
                alt="Content Image"
                className={cn(
                  "w-full object-cover transition-opacity",
                  getValues(`${fieldName}.style.objectFit`) === "Contain"
                    ? "object-contain"
                    : "object-cover"
                )}
                style={{
                  opacity: getValues(`${fieldName}.style.opacity`),
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <img
          {...register(`${fieldName}.source.src` as any)}
          src={source}
          alt="Content Image"
          className={cn(
            "rounded-md overflow-hidden max-w-full",
            getValues(`${fieldName}.style.objectFit`) === "Contain"
              ? "object-contain"
              : "object-cover",
            isImageOnlySlide && "max-h-[85vh]" // Give more height to image-only slides
          )}
          style={{
            opacity: getValues(`${fieldName}.style.opacity`),
            maxWidth: "100%",
            maxHeight: isImageOnlySlide ? "85vh" : "100%"
          }}
        />
      )}
    </div>
  );
}

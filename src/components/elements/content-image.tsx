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

export function ContentImage({
  fieldName,
  className,
}: {
  fieldName: ElementFieldPath;
  className?: string;
}) {
  const form: DocumentFormReturn = useFormContext();
  const { getValues, watch } = form;
  const image = getValues(fieldName) as z.infer<typeof ContentImageSchema>;

  const { setCurrentPage } = usePagerContext();
  const { currentSelection, setCurrentSelection } = useSelectionContext();
  const pageNumber = getSlideNumber(fieldName);
  const source = image.source.src || "https://placehold.co/400x200";
  
  // Check the slide style to apply special sizing/layout
  const slideStyle = watch(`slides.${pageNumber}.slideStyle`);
  const isImageOnlySlide = slideStyle === "Image";
  
  // Get all elements in this slide to determine if this is the only element
  const slideElements = watch(`slides.${pageNumber}.elements`);
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
    >
      {/* // TODO: Extract to component */}
      <img
        alt="slide image"
        src={source}
        className={cn(
          "rounded-md overflow-hidden max-w-full",
          image.style.objectFit == ObjectFitType.enum.Cover
            ? "object-cover w-full h-full"
            : image.style.objectFit == ObjectFitType.enum.Contain
            ? "object-contain w-auto max-h-full"
            : "",
          isImageOnlySlide && "max-h-[85vh]" // Give more height to image-only slides
        )}
        style={{
          opacity: image.style.opacity / 100,
          maxWidth: "100%",
          maxHeight: isImageOnlySlide ? "85vh" : "100%"
        }}
        onClick={(event) => {
          setCurrentPage(pageNumber);
          setCurrentSelection(fieldName, event);
        }}
      />
    </div>
  );
}

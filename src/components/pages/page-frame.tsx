import React from "react";
import { cn } from "@/lib/utils";
import { usePagerContext } from "@/lib/providers/pager-context";
import { getParent, getSlideNumber } from "@/lib/field-path";
import { useSelection } from "@/lib/hooks/use-selection";
import { useSelectionContext } from "@/lib/providers/selection-context";
import { ImageSourceFieldPath } from "@/lib/document-form-types";

export function PageFrame({
  fieldName,
  children,
  className,
}: {
  fieldName: ImageSourceFieldPath;
  children: React.ReactNode;
  className?: string;
}) {
  const { setCurrentPage } = usePagerContext();
  const { setCurrentSelection } = useSelectionContext();
  const pageNumber = getSlideNumber(fieldName);

  return (
    <div
      className={cn(
        "flex flex-col justify-between h-full overflow-hidden rounded-xl border border-border/50 shadow-md", 
        className
      )}
      tabIndex={0}
      onClick={() => {
        setCurrentPage(pageNumber);
        setCurrentSelection(fieldName, null);
      }}
    >
      {children}
    </div>
  );
}

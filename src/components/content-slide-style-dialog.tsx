import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Image, LayoutTemplate, Monitor } from "lucide-react";

// Enum for content slide styles
export enum ContentSlideStyle {
  Text = "text",
  TextImage = "text-image",
  Image = "image",
  Screenshot = "screenshot"
}

interface StyleOptionProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}

const StyleOption = ({ title, icon, description, onClick }: StyleOptionProps) => (
  <Button
    variant="outline"
    className="h-auto flex flex-col items-center p-6 gap-2 justify-between hover:border-primary"
    onClick={onClick}
  >
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="font-medium text-lg">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground text-center">{description}</p>
  </Button>
);

interface ContentSlideStyleDialogProps {
  onStyleSelect: (style: ContentSlideStyle) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentSlideStyleDialog({
  onStyleSelect,
  open,
  onOpenChange,
}: ContentSlideStyleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Choose Content Slide Layout</DialogTitle>
          <DialogDescription>
            Select a layout for your content slide. You can customize it further after selection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
          <StyleOption
            title="Text"
            icon={<FileText className="w-10 h-10 text-primary" />}
            description="Clean layout with just text content"
            onClick={() => {
              onStyleSelect(ContentSlideStyle.Text);
              onOpenChange(false);
            }}
          />
          <StyleOption
            title="Text + Image"
            icon={<LayoutTemplate className="w-10 h-10 text-primary" />}
            description="Balanced layout with text and supporting image"
            onClick={() => {
              onStyleSelect(ContentSlideStyle.TextImage);
              onOpenChange(false);
            }}
          />
          <StyleOption
            title="Image"
            icon={<Image className="w-10 h-10 text-primary" />}
            description="Image-focused slide with minimal text"
            onClick={() => {
              onStyleSelect(ContentSlideStyle.Image);
              onOpenChange(false);
            }}
          />
          <StyleOption
            title="Screenshot"
            icon={<Monitor className="w-10 h-10 text-primary" />}
            description="Optimized for displaying screenshots with context"
            onClick={() => {
              onStyleSelect(ContentSlideStyle.Screenshot);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 
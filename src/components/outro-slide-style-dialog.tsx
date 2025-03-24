import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, UserCircle } from "lucide-react";

// Enum for outro slide styles
export enum OutroSlideStyle {
  Classic = "classic",
  Headshot = "headshot",
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

interface OutroSlideStyleDialogProps {
  onStyleSelect: (style: OutroSlideStyle) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OutroSlideStyleDialog({
  onStyleSelect,
  open,
  onOpenChange,
}: OutroSlideStyleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Outro Slide Style</DialogTitle>
          <DialogDescription>
            Select a style for your outro slide. You can customize it further after selection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <StyleOption
            title="Classic"
            icon={<FileText className="w-10 h-10 text-primary" />}
            description="Standard outro slide with title and content"
            onClick={() => {
              onStyleSelect(OutroSlideStyle.Classic);
              onOpenChange(false);
            }}
          />
          <StyleOption
            title="Headshot"
            icon={<UserCircle className="w-10 h-10 text-primary" />}
            description="Outro slide featuring your profile avatar"
            onClick={() => {
              onStyleSelect(OutroSlideStyle.Headshot);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 
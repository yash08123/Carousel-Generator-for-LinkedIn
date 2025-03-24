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
import { FileText, SmilePlus, UserCircle } from "lucide-react";

// Enum for intro slide styles
export enum IntroSlideStyle {
  Classic = "classic",
  Emoji = "emoji",
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

interface IntroSlideStyleDialogProps {
  onStyleSelect: (style: IntroSlideStyle) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntroSlideStyleDialog({
  onStyleSelect,
  open,
  onOpenChange,
}: IntroSlideStyleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Intro Slide Style</DialogTitle>
          <DialogDescription>
            Select a style for your intro slide. You can customize it further after selection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <StyleOption
            title="Classic"
            icon={<FileText className="w-10 h-10 text-primary" />}
            description="Standard intro slide with title and content"
            onClick={() => {
              onStyleSelect(IntroSlideStyle.Classic);
              onOpenChange(false);
            }}
          />
          <StyleOption
            title="Emoji"
            icon={<SmilePlus className="w-10 h-10 text-primary" />}
            description="Intro slide with a featured emoji"
            onClick={() => {
              onStyleSelect(IntroSlideStyle.Emoji);
              onOpenChange(false);
            }}
          />
          <StyleOption
            title="Headshot"
            icon={<UserCircle className="w-10 h-10 text-primary" />}
            description="Intro slide featuring your profile avatar"
            onClick={() => {
              onStyleSelect(IntroSlideStyle.Headshot);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 
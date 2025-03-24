import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlideType } from "@/lib/validation/slide-schema";
import { Plus, X } from "lucide-react";
import { IntroSlideStyleDialog, IntroSlideStyle } from "./intro-slide-style-dialog";
import { OutroSlideStyleDialog, OutroSlideStyle } from "./outro-slide-style-dialog";
import { ContentSlideStyleDialog, ContentSlideStyle } from "./content-slide-style-dialog";

export function NewSlideDialogContent({
  handleAddPage,
}: {
  handleAddPage: (pageType: SlideType, slideStyle?: string) => void;
}) {
  // States to control the style selection modals
  const [introStyleOpen, setIntroStyleOpen] = useState(false);
  const [outroStyleOpen, setOutroStyleOpen] = useState(false);
  const [contentStyleOpen, setContentStyleOpen] = useState(false);
  
  // Function to close the parent dialog
  const closeParentDialog = () => {
    const closeButton = document.querySelector('[data-radix-collection-item]') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  };

  return (
    <>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Slide</DialogTitle>
          <DialogDescription>
            {"Select the type of slide to add."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <Button
              onClick={() => {
                setContentStyleOpen(true);
                closeParentDialog();
              }}
            >
              Content Slide
            </Button>
            <Button
              onClick={() => {
                setIntroStyleOpen(true);
                closeParentDialog();
              }}
            >
              Intro Slide
            </Button>
            <Button
              onClick={() => {
                setOutroStyleOpen(true);
                closeParentDialog();
              }}
            >
              Outro Slide
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Content Style Selection Modal */}
      <ContentSlideStyleDialog 
        open={contentStyleOpen} 
        onOpenChange={setContentStyleOpen}
        onStyleSelect={(style) => {
          handleAddPage(SlideType.enum.Content, style);
        }}
      />

      {/* Intro Style Selection Modal */}
      <IntroSlideStyleDialog 
        open={introStyleOpen} 
        onOpenChange={setIntroStyleOpen}
        onStyleSelect={(style) => {
          handleAddPage(SlideType.enum.Intro, style);
        }}
      />

      {/* Outro Style Selection Modal */}
      <OutroSlideStyleDialog 
        open={outroStyleOpen} 
        onOpenChange={setOutroStyleOpen}
        onStyleSelect={(style) => {
          handleAddPage(SlideType.enum.Outro, style);
        }}
      />
    </>
  );
}

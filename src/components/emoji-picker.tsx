import React from "react";
import { Button } from "@/components/ui/button";
import { SmilePlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

// Common emoji set for quick selection
const commonEmojis = [
  "😊", "😂", "❤️", "👍", "👏", "🎉", "✨", "🔥", "💯", "👀",
  "🙌", "💪", "🚀", "💡", "⭐", "📈", "🏆", "👋", "🤔", "💼",
  "🌟", "📊", "📱", "💻", "🔍", "📝", "📚", "🧠", "🤝", "🎯",
  "📣", "📢", "🔔", "⏰", "⚡", "🌈", "🎓", "🌱", "💰", "💎"
];

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <SmilePlus className="h-4 w-4 mr-2" />
          Pick
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Select Emoji</h4>
          <div className="grid grid-cols-8 gap-1">
            {commonEmojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                className="h-8 w-8 p-0 text-lg"
                onClick={() => {
                  onEmojiSelect(emoji);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 
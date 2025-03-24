import React from "react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { ElementsSchema, ElementType } from "@/lib/validation/elements-schema";

interface BackgroundElementsLayerProps {
  elements: z.infer<typeof ElementsSchema>;
  className?: string;
  primaryColor: string;
  secondaryColor: string;
}

export function BackgroundElementsLayer({
  elements,
  className = "",
  primaryColor,
  secondaryColor,
}: BackgroundElementsLayerProps) {
  // Return null if background elements are disabled or type is None
  if (!elements?.enabled || elements?.type === ElementType.None) {
    return null;
  }

  // Create a safe wrapper function to handle potential undefined values
  const renderGradient = () => {
    try {
      if (elements?.type !== ElementType.Gradient || !elements?.gradient?.direction) {
        return null;
      }

      const direction = elements.gradient.direction || "to-r";
      const opacity = (elements.gradient?.opacity ?? 50) / 100;

      return (
        <div
          className={cn("w-full h-full absolute inset-0")}
          style={{
            backgroundImage: `linear-gradient(${direction.replace("to-", "to ")}, ${primaryColor}, ${secondaryColor})`,
            opacity: opacity,
          }}
        />
      );
    } catch (error) {
      console.error("Error rendering gradient:", error);
      return null;
    }
  };

  const renderGrid = () => {
    try {
      if (elements?.type !== ElementType.Grid || !elements?.grid) {
        return null;
      }

      const size = elements.grid.size || "md";
      const opacity = (elements.grid.opacity ?? 50) / 100;
      const gridSize = size === "sm" ? "20px 20px" : size === "md" ? "40px 40px" : "60px 60px";

      return (
        <div
          className={cn("w-full h-full absolute inset-0 bg-grid")}
          style={{
            opacity: opacity,
            backgroundSize: gridSize,
            backgroundImage: `linear-gradient(to right, ${primaryColor}20 1px, transparent 1px), 
                           linear-gradient(to bottom, ${primaryColor}20 1px, transparent 1px)`,
          }}
        />
      );
    } catch (error) {
      console.error("Error rendering grid:", error);
      return null;
    }
  };

  const renderDots = () => {
    try {
      if (elements?.type !== ElementType.Dots || !elements?.dots) {
        return null;
      }

      const size = elements.dots.size || "md";
      const opacity = (elements.dots.opacity ?? 50) / 100;
      const dotSize = size === "sm" ? "20px 20px" : size === "md" ? "40px 40px" : "60px 60px";

      return (
        <div
          className={cn("w-full h-full absolute inset-0 bg-dots")}
          style={{
            opacity: opacity,
            backgroundSize: dotSize,
            backgroundImage: `radial-gradient(${primaryColor}40 2px, transparent 0)`,
            backgroundPosition: "0 0",
            backgroundRepeat: "repeat",
          }}
        />
      );
    } catch (error) {
      console.error("Error rendering dots:", error);
      return null;
    }
  };

  const renderWaves = () => {
    try {
      if (elements?.type !== ElementType.Waves || !elements?.waves) {
        return null;
      }

      const amplitude = elements.waves.amplitude || "medium";
      const opacity = (elements.waves.opacity ?? 50) / 100;
      const scale = amplitude === "low" ? 1.2 : amplitude === "medium" ? 1.5 : 2;

      return (
        <div
          className={cn("w-full h-full absolute inset-0 bg-waves")}
          style={{
            opacity: opacity,
            maskImage: "linear-gradient(to bottom, transparent, black, transparent)",
            backgroundImage: `
              repeating-linear-gradient(
                35deg,
                ${primaryColor}20,
                ${primaryColor}20 10px,
                ${secondaryColor}20 10px,
                ${secondaryColor}20 20px
              )
            `,
            backgroundSize: "100% 100%",
            transform: `scale(${scale})`,
          }}
        />
      );
    } catch (error) {
      console.error("Error rendering waves:", error);
      return null;
    }
  };

  const renderGeometric = () => {
    try {
      if (elements?.type !== ElementType.Geometric || !elements?.geometric) {
        return null;
      }

      const pattern = elements.geometric.pattern || "triangles";
      const size = elements.geometric.size || "md";
      const opacity = (elements.geometric.opacity ?? 50) / 100;
      const geoSize = size === "sm" ? "30px 30px" : size === "md" ? "50px 50px" : "70px 70px";

      let backgroundImage;
      let backgroundPosition;

      if (pattern === "triangles") {
        backgroundImage = `linear-gradient(60deg, ${primaryColor}30 25%, transparent 25.5%),
                          linear-gradient(0deg, ${primaryColor}30 25%, transparent 25.5%),
                          linear-gradient(60deg, transparent 75%, ${primaryColor}30 75.5%),
                          linear-gradient(0deg, transparent 75%, ${primaryColor}30 75.5%)`;
        backgroundPosition = "0 0, 0 0, 0 0, 0 0";
      } else if (pattern === "squares") {
        backgroundImage = `linear-gradient(45deg, ${primaryColor}30 25%, transparent 25.5%, transparent 75%, ${primaryColor}30 75.5%),
                          linear-gradient(45deg, ${primaryColor}30 25%, transparent 25.5%, transparent 75%, ${primaryColor}30 75.5%)`;
        backgroundPosition = "0 0, 25px 25px";
      } else {
        backgroundImage = `radial-gradient(${primaryColor}30 25%, transparent 25.5%)`;
        backgroundPosition = "0 0, 25px 25px, 50px 50px";
      }

      return (
        <div
          className={cn("w-full h-full absolute inset-0 bg-geometric")}
          style={{
            opacity: opacity,
            backgroundSize: geoSize,
            backgroundImage: backgroundImage,
            backgroundPosition: backgroundPosition,
          }}
        />
      );
    } catch (error) {
      console.error("Error rendering geometric:", error);
      return null;
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full absolute top-0 left-0 right-0 bottom-0 overflow-hidden",
        className
      )}
    >
      {elements.type === ElementType.Gradient && renderGradient()}
      {elements.type === ElementType.Grid && renderGrid()}
      {elements.type === ElementType.Dots && renderDots()}
      {elements.type === ElementType.Waves && renderWaves()}
      {elements.type === ElementType.Geometric && renderGeometric()}
    </div>
  );
} 
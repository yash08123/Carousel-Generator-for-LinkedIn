import { useFormContext } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "../ui/checkbox";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { TypographyH3, TypographyH4 } from "../typography";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import {
  SwipeIndicatorPosition,
  SwipeIndicatorShape,
  SwipeIndicatorSize,
} from "@/lib/validation/swipe-indicator-schema";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Circle,
  CornerDownRight,
  CornerRightDown,
  ChevronRight,
  Maximize,
  Minimize,
  RectangleHorizontal,
  ScreenShare,
  Square,
  ArrowUpRightSquare
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useSelectionContext } from "@/lib/providers/selection-context";

export function SwipeIndicatorForm() {
  const form: DocumentFormReturn = useFormContext();
  const { currentSelection } = useSelectionContext();

  // Check if a swipe indicator is selected
  const isSwipeIndicatorSelected = currentSelection &&
    !currentSelection.includes('.elements.') &&
    currentSelection.includes('slides.');

  return (
    <Form {...form}>
      <form className="space-y-6 w-full py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            <TypographyH3>Swipe Indicator</TypographyH3>
          </div>
          <p className="text-sm text-muted-foreground">
            Control the swipe indicator appearance on intro slides
          </p>
        </div>
        <Separator className="my-4" />

        <FormField
          control={form.control}
          name="config.swipeIndicator.showSwipeIndicator"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-base font-medium">Show swipe indicator on intro slides</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Only show style options if swipe indicators are enabled */}
        {form.watch("config.swipeIndicator.showSwipeIndicator") && (
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="appearance">Look</TabsTrigger>
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-3">
                <TypographyH4 className="flex items-center gap-2">
                  <RectangleHorizontal className="h-4 w-4 text-primary" />
                  <span>Shape</span>
                </TypographyH4>
                <FormField
                  control={form.control}
                  name="config.swipeIndicator.shape"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-2"
                      >
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorShape.Pill}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center aspect-square transition-colors">
                              <div className="w-10 h-5 rounded-full bg-primary/80 flex items-center justify-center">
                                <span className="text-xs text-white">Pill</span>
                              </div>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorShape.Rectangle}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center aspect-square transition-colors">
                              <div className="w-10 h-5 rounded-sm bg-primary/80 flex items-center justify-center">
                                <span className="text-xs text-white">Rect</span>
                              </div>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorShape.Rounded}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center aspect-square transition-colors">
                              <div className="w-10 h-5 rounded-md bg-primary/80 flex items-center justify-center">
                                <span className="text-xs text-white">Round</span>
                              </div>
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <TypographyH4 className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 text-primary" />
                  <span>Size</span>
                </TypographyH4>
                <FormField
                  control={form.control}
                  name="config.swipeIndicator.size"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-2"
                      >
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorSize.Small}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center transition-colors">
                              <span className="text-xs">Small</span>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorSize.Medium}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center transition-colors">
                              <span className="text-sm mx-2">Medium</span>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorSize.Large}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center transition-colors">
                              <span className="text-base">Large</span>
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 pt-2">
                <TypographyH4 className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-primary" />
                  <span>Color</span>
                </TypographyH4>
                <FormField
                  control={form.control}
                  name="config.swipeIndicator.useThemeColor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Use theme color</FormLabel>
                        <FormDescription>
                          Match the primary color of your theme
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!form.watch("config.swipeIndicator.useThemeColor") && (
                  <FormField
                    control={form.control}
                    name="config.swipeIndicator.customColor"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <FormLabel>Custom Color</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-10 h-10 p-1" />
                          </FormControl>
                          <FormControl>
                            <Input {...field} className="w-full font-mono" />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </TabsContent>

            {/* Position Tab */}
            <TabsContent value="position" className="space-y-4">
              <div className="space-y-3">
                <TypographyH4 className="flex items-center gap-2">
                  <CornerRightDown className="h-4 w-4 text-primary" />
                  <span>Position</span>
                </TypographyH4>
                <FormField
                  control={form.control}
                  name="config.swipeIndicator.position"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorPosition.BottomRight}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center aspect-square relative transition-colors">
                              <div className="w-full h-full border border-dashed border-muted-foreground rounded-md">
                                <div className="absolute bottom-1 right-1 w-8 h-4 rounded-full bg-primary/80"></div>
                              </div>
                            </div>
                            <span className="block text-center mt-1 text-xs">Bottom Right</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorPosition.BottomLeft}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center aspect-square relative transition-colors">
                              <div className="w-full h-full border border-dashed border-muted-foreground rounded-md">
                                <div className="absolute bottom-1 left-1 w-8 h-4 rounded-full bg-primary/80"></div>
                              </div>
                            </div>
                            <span className="block text-center mt-1 text-xs">Bottom Left</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorPosition.BottomCenter}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center aspect-square relative transition-colors">
                              <div className="w-full h-full border border-dashed border-muted-foreground rounded-md">
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-4 rounded-full bg-primary/80"></div>
                              </div>
                            </div>
                            <span className="block text-center mt-1 text-xs">Bottom Center</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                            <FormControl>
                              <RadioGroupItem
                                value={SwipeIndicatorPosition.TopRight}
                                className="sr-only"
                              />
                            </FormControl>
                            <div className="border-2 rounded-md p-2 flex items-center justify-center aspect-square relative transition-colors">
                              <div className="w-full h-full border border-dashed border-muted-foreground rounded-md">
                                <div className="absolute top-1 right-1 w-8 h-4 rounded-full bg-primary/80"></div>
                              </div>
                            </div>
                            <span className="block text-center mt-1 text-xs">Top Right</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-3">
                <TypographyH4 className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span>Custom Text</span>
                </TypographyH4>
                <FormField
                  control={form.control}
                  name="config.swipeIndicator.customText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicator Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Swipe"
                          {...field}
                          className="w-full"
                          maxLength={15}
                        />
                      </FormControl>
                      <FormDescription>
                        Customize the text displayed in the swipe indicator
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </form>
    </Form>
  );
}
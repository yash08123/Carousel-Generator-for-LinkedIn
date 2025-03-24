import { useFormContext } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ElementType } from "@/lib/validation/elements-schema";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup } from "../ui/radio-group";
import { CustomIndicatorRadioGroupItem } from "../custom-indicator-radio-group-item";
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Grid, LayoutGrid, Circle, Waves, Triangle } from "lucide-react";

// Element type selection component
function ElementTypeSelector({ form }: { form: DocumentFormReturn }) {
  const { control, setValue } = form;

  // Helper function to ensure element properties are initialized
  const initializeElementProperties = (elementType: ElementType) => {
    // Set the element type
    setValue("config.elements.type", elementType);
    
    // Initialize properties based on the selected type
    if (elementType === ElementType.Gradient) {
      setValue("config.elements.gradient", {
        direction: "to-r",
        opacity: 50,
      });
    } else if (elementType === ElementType.Grid) {
      setValue("config.elements.grid", {
        size: "md",
        opacity: 50,
        color: "currentColor",
      });
    } else if (elementType === ElementType.Dots) {
      setValue("config.elements.dots", {
        size: "md",
        opacity: 50,
        spacing: "normal",
      });
    } else if (elementType === ElementType.Waves) {
      setValue("config.elements.waves", {
        amplitude: "medium",
        opacity: 50,
      });
    } else if (elementType === ElementType.Geometric) {
      setValue("config.elements.geometric", {
        pattern: "triangles",
        size: "md",
        opacity: 50,
      });
    }
  };

  return (
    <FormField
      control={control}
      name="config.elements.type"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Element Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                initializeElementProperties(value as ElementType);
              }}
              defaultValue={field.value}
              className="grid grid-cols-3 gap-2"
            >
              <FormItem className="flex flex-col items-center space-y-1">
                <FormControl>
                  <CustomIndicatorRadioGroupItem value={ElementType.None}>
                    <div className="flex flex-col items-center justify-center p-2">
                      <div className="w-8 h-8 flex items-center justify-center">None</div>
                      <span className="text-xs mt-1">None</span>
                    </div>
                  </CustomIndicatorRadioGroupItem>
                </FormControl>
              </FormItem>
              
              <FormItem className="flex flex-col items-center space-y-1">
                <FormControl>
                  <CustomIndicatorRadioGroupItem value={ElementType.Gradient}>
                    <div className="flex flex-col items-center justify-center p-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary/50 to-secondary/50 rounded"></div>
                      <span className="text-xs mt-1">Gradient</span>
                    </div>
                  </CustomIndicatorRadioGroupItem>
                </FormControl>
              </FormItem>
              
              <FormItem className="flex flex-col items-center space-y-1">
                <FormControl>
                  <CustomIndicatorRadioGroupItem value={ElementType.Grid}>
                    <div className="flex flex-col items-center justify-center p-2">
                      <LayoutGrid className="w-8 h-8" />
                      <span className="text-xs mt-1">Grid</span>
                    </div>
                  </CustomIndicatorRadioGroupItem>
                </FormControl>
              </FormItem>
              
              <FormItem className="flex flex-col items-center space-y-1">
                <FormControl>
                  <CustomIndicatorRadioGroupItem value={ElementType.Dots}>
                    <div className="flex flex-col items-center justify-center p-2">
                      <Circle className="w-8 h-8" />
                      <span className="text-xs mt-1">Dots</span>
                    </div>
                  </CustomIndicatorRadioGroupItem>
                </FormControl>
              </FormItem>
              
              <FormItem className="flex flex-col items-center space-y-1">
                <FormControl>
                  <CustomIndicatorRadioGroupItem value={ElementType.Waves}>
                    <div className="flex flex-col items-center justify-center p-2">
                      <Waves className="w-8 h-8" />
                      <span className="text-xs mt-1">Waves</span>
                    </div>
                  </CustomIndicatorRadioGroupItem>
                </FormControl>
              </FormItem>
              
              <FormItem className="flex flex-col items-center space-y-1">
                <FormControl>
                  <CustomIndicatorRadioGroupItem value={ElementType.Geometric}>
                    <div className="flex flex-col items-center justify-center p-2">
                      <Triangle className="w-8 h-8" />
                      <span className="text-xs mt-1">Geometric</span>
                    </div>
                  </CustomIndicatorRadioGroupItem>
                </FormControl>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Gradient element options
function GradientOptions({ form }: { form: DocumentFormReturn }) {
  return (
    <>
      <FormField
        control={form.control}
        name="config.elements.gradient.direction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Direction</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="to-r">Right</SelectItem>
                <SelectItem value="to-l">Left</SelectItem>
                <SelectItem value="to-t">Top</SelectItem>
                <SelectItem value="to-b">Bottom</SelectItem>
                <SelectItem value="to-tr">Top Right</SelectItem>
                <SelectItem value="to-tl">Top Left</SelectItem>
                <SelectItem value="to-br">Bottom Right</SelectItem>
                <SelectItem value="to-bl">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.elements.gradient.opacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opacity: {field.value}%</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={100}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(vals) => {
                  field.onChange(vals[0]);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Grid element options
function GridOptions({ form }: { form: DocumentFormReturn }) {
  return (
    <>
      <FormField
        control={form.control}
        name="config.elements.grid.size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Size</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.elements.grid.opacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opacity: {field.value}%</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={100}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(vals) => {
                  field.onChange(vals[0]);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Dots element options
function DotsOptions({ form }: { form: DocumentFormReturn }) {
  return (
    <>
      <FormField
        control={form.control}
        name="config.elements.dots.size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Size</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.elements.dots.spacing"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Spacing</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select spacing" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="tight">Tight</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="loose">Loose</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.elements.dots.opacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opacity: {field.value}%</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={100}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(vals) => {
                  field.onChange(vals[0]);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Waves element options
function WavesOptions({ form }: { form: DocumentFormReturn }) {
  return (
    <>
      <FormField
        control={form.control}
        name="config.elements.waves.amplitude"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amplitude</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select amplitude" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.elements.waves.opacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opacity: {field.value}%</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={100}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(vals) => {
                  field.onChange(vals[0]);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// Geometric element options
function GeometricOptions({ form }: { form: DocumentFormReturn }) {
  return (
    <>
      <FormField
        control={form.control}
        name="config.elements.geometric.pattern"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pattern</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="triangles">Triangles</SelectItem>
                <SelectItem value="squares">Squares</SelectItem>
                <SelectItem value="hexagons">Hexagons</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.elements.geometric.size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Size</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.elements.geometric.opacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opacity: {field.value}%</FormLabel>
            <FormControl>
              <Slider
                min={0}
                max={100}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(vals) => {
                  field.onChange(vals[0]);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function ElementsForm() {
  const form: DocumentFormReturn = useFormContext();
  const { watch, setValue } = form;
  const isEnabled = watch("config.elements.enabled");
  const elementType = watch("config.elements.type");

  // Initialize default values when toggling on
  const handleEnableToggle = (enabled: boolean) => {
    setValue("config.elements.enabled", enabled);
    
    // If enabling and no element type is selected, set a default
    if (enabled && (!elementType || elementType === ElementType.None)) {
      // Set gradient as the default element type when enabling
      setValue("config.elements.type", ElementType.Gradient);
      
      // Initialize gradient properties
      setValue("config.elements.gradient", {
        direction: "to-r",
        opacity: 50,
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6 w-full py-4">
        <FormField
          control={form.control}
          name="config.elements.enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    handleEnableToggle(!!checked);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none text-base">
                <FormLabel>Enable background elements</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {isEnabled && (
          <>
            <ElementTypeSelector form={form} />

            {elementType === ElementType.Gradient && <GradientOptions form={form} />}
            {elementType === ElementType.Grid && <GridOptions form={form} />}
            {elementType === ElementType.Dots && <DotsOptions form={form} />}
            {elementType === ElementType.Waves && <WavesOptions form={form} />}
            {elementType === ElementType.Geometric && <GeometricOptions form={form} />}
          </>
        )}
      </form>
    </Form>
  );
} 
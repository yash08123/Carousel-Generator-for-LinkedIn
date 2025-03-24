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
import {
  DocumentFormReturn,
  ElementArrayFieldPath,
} from "@/lib/document-form-types";
import { DEFAULT_CONTENT_IMAGE_INPUT } from "@/lib/validation/image-schema";
import {
  DescriptionSchema,
  SubtitleSchema,
  TitleSchema,
} from "@/lib/validation/text-schema";
import { EmojiSchema, DEFAULT_EMOJI } from "@/lib/validation/emoji-schema";
import { AvatarSchema, DEFAULT_AVATAR } from "@/lib/validation/avatar-schema";
import { UserCircle, SmilePlus, Type, FileText, Image, TextQuote } from "lucide-react";
import { useFieldArray } from "react-hook-form";

export function NewElementDialogContent({
  form,
  fieldName,
}: {
  form: DocumentFormReturn;
  fieldName: ElementArrayFieldPath;
}) {
  const { control } = form;
  const { append, fields } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: fieldName, // unique name for your Field Array
  });
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>New Element</DialogTitle>
        <DialogDescription>
          {"Select the type of element to add."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 items-center gap-4">
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                append(TitleSchema.parse({}));
              }}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Type className="h-5 w-5 mb-2" />
              <span>Title</span>
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                append(SubtitleSchema.parse({}));
              }}
              className="flex flex-col items-center p-4 h-auto"
            >
              <TextQuote className="h-5 w-5 mb-2" />
              <span>Subtitle</span>
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                append(DescriptionSchema.parse({}));
              }}
              className="flex flex-col items-center p-4 h-auto"
            >
              <FileText className="h-5 w-5 mb-2" />
              <span>Description</span>
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                append({ ...DEFAULT_CONTENT_IMAGE_INPUT });
              }}
              className="flex flex-col items-center p-4 h-auto"
            >
              <Image className="h-5 w-5 mb-2" />
              <span>Image</span>
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                append({ ...DEFAULT_EMOJI });
              }}
              className="flex flex-col items-center p-4 h-auto"
            >
              <SmilePlus className="h-5 w-5 mb-2" />
              <span>Emoji</span>
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                append({ ...DEFAULT_AVATAR });
              }}
              className="flex flex-col items-center p-4 h-auto"
            >
              <UserCircle className="h-5 w-5 mb-2" />
              <span>Avatar</span>
            </Button>
          </DialogTrigger>
        </div>
      </div>
    </DialogContent>
  );
}

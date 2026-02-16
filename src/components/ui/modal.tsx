import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ReactNode } from "react";
import { cn } from "@/lib";
import { ScrollArea } from "./scroll-area";

interface IProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  closeButtonClassname?: string;
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  contentClassName,
  titleClassName,
  descriptionClassName,
  closeButtonClassname,
}: IProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={contentClassName} showCloseButton={false}>
        {/* <ScrollArea className="min-h-full overflow-y-auto"> */}
        {title && (
          <DialogHeader>
            <CloseButtonModal closeButtonClassname={closeButtonClassname} />
            <DialogTitle className={titleClassName}>{title}</DialogTitle>
            {description && (
              <DialogDescription className={descriptionClassName}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <ScrollArea className="max-h-[85svh] overflow-y-auto">
          {children}
        </ScrollArea>
        {footer && <DialogFooter>{footer}</DialogFooter>}
        {/* </ScrollArea> */}
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
interface ICloseButtonProps {
  closeButtonClassname?: string;
}
export function CloseButtonModal({ closeButtonClassname }: ICloseButtonProps) {
  return (
    <DialogClose
      className={cn(
        "w-6 h-6 bg-transparent rounded-full text-gray-700 border-2 border-gray-700 flex justify-center items-center absolute right-4 top-4",
        closeButtonClassname && closeButtonClassname,
      )}
    >
      <X className="size-4" />
    </DialogClose>
  );
}

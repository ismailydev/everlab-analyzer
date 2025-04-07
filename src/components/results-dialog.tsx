import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResultsDialog({ isOpen, onClose }: ResultsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>Test Results Analysis</DialogTitle>
        </DialogHeader>

        <div>Results Dialog</div>
      </DialogContent>
    </Dialog>
  );
}

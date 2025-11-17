"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function AcceptDialog({
  userId,
  action,
  callbackAction,
}: {
  userId: string;
  action: (id: string) => Promise<{ success: boolean; message: string }>;
  callbackAction?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="cursor-pointer">
          Pending
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Accept Affiliate Request?</AlertDialogTitle>
          <AlertDialogDescription>
            Once accepted, this user will become an Affiliater. This action
            cannot be reverted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="justify-between">
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>

          <Button
            size="sm"
            variant="default"
            className="cursor-pointer"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await action(userId);
                if (!res.success) {
                  toast.error(res.message);
                } else {
                  setOpen(false);
                  toast.success(res.message);
                  if (callbackAction) callbackAction();
                }
              })
            }
          >
            {isPending ? "Accepting..." : "Accept"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

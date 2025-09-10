"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { api } from "@workspace/backend/convex/_generated/api"
import type { PublicFile } from "@workspace/backend/convex/private/files"

interface DeleteFileDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  file: PublicFile | null
  onDeleted?: () => void
}

export const DeleteFileDialog = ({
  file,
  onDeleted,
  open,
  onOpenChange,
}: DeleteFileDialogProps) => {
  const deleteFile = useMutation(api.private.files.deleteFile)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!file) return
    setIsDeleting(true)
    try {
      await deleteFile({ entryId: file.id })
      onDeleted?.()
      onOpenChange?.(false)
    } catch (error) {
      console.error("Error deleting file:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the file{" "}
            <span className="font-medium">{file?.name}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {file && (
          <div className="py-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Type: {file.type.toUpperCase()} | Size: {file.size}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !file}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

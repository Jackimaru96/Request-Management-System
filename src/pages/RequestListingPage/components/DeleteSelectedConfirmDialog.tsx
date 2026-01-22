import { JSX } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface DeleteSelectedConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
}

function DeleteSelectedConfirmDialog(props: DeleteSelectedConfirmDialogProps): JSX.Element {
  const { open, onClose, onConfirm, selectedCount } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete selected tasks?</DialogTitle>
      <DialogContent>
        <Typography>
          This will mark {selectedCount} selected {selectedCount === 1 ? "task" : "tasks"} for
          deletion and include {selectedCount === 1 ? "it" : "them"} in the next XML export.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteSelectedConfirmDialog;

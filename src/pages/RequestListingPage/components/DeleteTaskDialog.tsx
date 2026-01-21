import { JSX } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskUrl?: string;
}

function DeleteTaskDialog(props: DeleteTaskDialogProps): JSX.Element {
  const { open, onClose, onConfirm, taskUrl } = props;

  const handleConfirm = (): void => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete task?</DialogTitle>
      <DialogContent>
        <Typography>
          This will mark the task for deletion and include it in the next XML export.
        </Typography>
        {taskUrl && (
          <Typography sx={{ mt: 2, fontWeight: "medium" }}>
            URL: {taskUrl}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteTaskDialog;

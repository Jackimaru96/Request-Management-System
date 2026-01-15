import { JSX, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";

interface AddTasksDialogProps {
  open: boolean;
  onClose: () => void;
  onManualAdd: () => void;
}

function AddTasksDialog(props: AddTasksDialogProps): JSX.Element {
  const { open, onClose, onManualAdd } = props;
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList): void => {
    const file = files[0];
    const validTypes = [".csv", ".xlsx", ".xls"];
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));

    if (validTypes.includes(fileExtension.toLowerCase())) {
      // TODO: Process the file
      console.log("File accepted:", file.name);
      // Here you would parse the CSV/Excel file and extract tasks
    } else {
      alert("Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)");
    }
  };

  const handleManualAdd = (): void => {
    onClose();
    onManualAdd();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={onClose} size="small">
            <ArrowBackIcon />
          </IconButton>
          Add Tasks
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* File Upload Area */}
        <Box
          sx={{
            border: "2px dashed",
            borderColor: dragActive ? "primary.main" : "grey.600",
            borderRadius: 2,
            p: 6,
            textAlign: "center",
            bgcolor: dragActive ? "action.hover" : "transparent",
            transition: "all 0.3s",
            position: "relative",
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />

          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>

          <Typography variant="h6" gutterBottom>
            Drop CSV/Excel file here or click to browse
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Accepted formats: .csv, .xlsx
          </Typography>

          <Box sx={{ mt: 4, width: "100%" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or
            </Typography>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleManualAdd}
              sx={{ mt: 1 }}
            >
              Add a Task Manually
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled>
          Add Tasks
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTasksDialog;

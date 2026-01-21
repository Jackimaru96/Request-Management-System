import { JSX, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Task } from "../types";
import { formatFrequency, formatDepth, getPriorityLabel, toCamelCase } from "../helpers";
import AddTaskDialog from "./AddTaskDialog";
import { priorityColors } from "../../../utils/colours";

interface AddTasksStagingDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTasks: (
    tasks: Omit<Task, "id" | "status" | "createdTime" | "user" | "userGroup" | "changeStatus">[],
  ) => void;
}

function AddTasksStagingDialog(props: AddTasksStagingDialogProps): JSX.Element {
  const { open, onClose, onAddTasks } = props;

  // View state: 'upload' or 'staging'
  const [view, setView] = useState<"upload" | "staging">("upload");

  // Staging table state
  const [stagedTasks, setStagedTasks] = useState<
    Omit<Task, "id" | "status" | "createdTime" | "user" | "userGroup" | "changeStatus">[]
  >([]);

  // File upload state
  const [dragActive, setDragActive] = useState(false);

  // Add task dialog state
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);

  const handleClose = (): void => {
    setStagedTasks([]);
    setEditingTaskIndex(null);
    setView("upload");
    setDragActive(false);
    onClose();
  };

  const handleAddTask = (
    newTask: Omit<Task, "id" | "status" | "createdTime" | "user" | "userGroup" | "changeStatus">,
  ): void => {
    if (editingTaskIndex !== null) {
      // Update existing task
      const updatedTasks = [...stagedTasks];
      updatedTasks[editingTaskIndex] = newTask;
      setStagedTasks(updatedTasks);
      setEditingTaskIndex(null);
    } else {
      // Add new task
      setStagedTasks([...stagedTasks, newTask]);
    }
    setAddTaskDialogOpen(false);
  };

  const handleEditTask = (index: number): void => {
    setEditingTaskIndex(index);
    setAddTaskDialogOpen(true);
  };

  const handleDeleteTask = (index: number): void => {
    const updatedTasks = stagedTasks.filter((_, i) => i !== index);
    setStagedTasks(updatedTasks);
  };

  const handleAddTasks = (): void => {
    if (stagedTasks.length === 0) {
      alert("Please add at least one task");
      return;
    }
    onAddTasks(stagedTasks);
    handleClose();
  };

  const handleOpenAddDialog = (): void => {
    setEditingTaskIndex(null);
    setAddTaskDialogOpen(true);
  };

  const handleCloseAddDialog = (): void => {
    setEditingTaskIndex(null);
    setAddTaskDialogOpen(false);
  };

  const handleDrag = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent): void => {
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
    // TODO: Parse CSV/Excel files and convert to tasks
    console.log("Files to process:", files);
    // For now, just show an alert
    alert("File upload will be implemented. For now, please use 'Add a Task Manually'.");
  };

  const handleAddManually = (): void => {
    setView("staging");
    handleOpenAddDialog();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleClose} size="small">
              <ArrowBackIcon />
            </IconButton>
            Add Tasks
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {view === "upload" ? (
            <>
              {/* File Upload View */}
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: dragActive ? "primary.main" : "divider",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  bgcolor: dragActive ? "action.hover" : "transparent",
                  transition: "all 0.2s",
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadFileIcon sx={{ fontSize: 64, color: "action.disabled" }} />
                <Typography variant="h6" color="text.secondary">
                  Drop CSV/Excel here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
                <Button variant="outlined" component="label">
                  Browse Files
                  <input type="file" hidden accept=".csv,.xlsx,.xls" onChange={handleChange} />
                </Button>
                <Box
                  sx={{
                    mt: 2,
                    width: "100%",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    pt: 2,
                  }}
                >
                  <Button fullWidth variant="text" onClick={handleAddManually}>
                    Add a Task Manually
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <>
              {/* Staging Table View */}
              {stagedTasks.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>URL</TableCell>
                        <TableCell>Task Type</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Depth</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Country</TableCell>
                        <TableCell>Zone</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stagedTasks.map((task, index) => {
                        const priorityLabel = getPriorityLabel(task.priority);

                        const colors = priorityColors[priorityLabel] || {
                          bg: "#757575",
                          text: "#fff",
                        };

                        return (
                          <TableRow key={index}>
                            <TableCell>{task.url}</TableCell>
                            <TableCell>{toCamelCase(task.requestType)}</TableCell>
                            <TableCell>
                              {formatFrequency(task.requestType, task.recurringFreq)}
                            </TableCell>
                            <TableCell>{formatDepth(task.depth)}</TableCell>
                            <TableCell>
                              <Chip
                                label={priorityLabel}
                                size="small"
                                sx={{ bgcolor: colors.bg, color: colors.text }}
                              />
                            </TableCell>
                            <TableCell>{task.country || "-"}</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => handleEditTask(index)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteTask(index)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "text.secondary",
                  }}
                >
                  No tasks added yet. Click "+ ADD ANOTHER TASK" to add a task.
                </Box>
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ mt: 2 }}
              >
                + ADD ANOTHER TASK
              </Button>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            CANCEL
          </Button>
          {view === "staging" && (
            <Button
              onClick={handleAddTasks}
              variant="contained"
              disabled={stagedTasks.length === 0}
            >
              ADD TASKS
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add/Edit Task Dialog */}
      <AddTaskDialog
        open={addTaskDialogOpen}
        onClose={handleCloseAddDialog}
        onAddTask={handleAddTask}
        editingTask={editingTaskIndex !== null ? stagedTasks[editingTaskIndex] : undefined}
      />
    </>
  );
}

export default AddTasksStagingDialog;

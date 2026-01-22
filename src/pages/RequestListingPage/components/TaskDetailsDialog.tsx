import { JSX } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Task } from "../types";
import { formatDate, formatFrequency, formatDepth, getPriorityLabel, toCamelCase } from "../helpers";

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

function TaskDetailsDialog(props: TaskDetailsDialogProps): JSX.Element {
  const { open, onClose, task } = props;

  if (!task) {
    return <></>;
  }

  // Format task type for display
  const taskTypeDisplay =
    task.requestType.charAt(0).toUpperCase() + task.requestType.slice(1).toLowerCase();

  // Format frequency for display
  const frequencyDisplay = formatFrequency(task.requestType, task.recurringFreq);

  // Format depth for display
  const depthDisplay = formatDepth(task.depth);

  // Format collection status
  const collectionStatusDisplay = task.collectionStatus
    ? toCamelCase(task.collectionStatus)
    : "-";

  // Format last collected
  const lastCollectedDisplay = task.colEndTime ? formatDate(task.colEndTime) : "-";

  // Format collection start time
  const collectionStartDisplay = task.startCollectionTime
    ? formatDate(task.startCollectionTime)
    : "-";

  // Format collection end time
  const collectionEndDisplay = task.endCollectionTime
    ? formatDate(task.endCollectionTime)
    : "N/A";

  // Mock tasking history (if real history exists in future, replace this)
  const taskingHistory = task.latestEvent
    ? [
        {
          time: formatDate(task.latestEvent.createdTime),
          status: toCamelCase(task.latestEvent.eventType),
        },
      ]
    : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#2d2d2d",
          color: "#fff",
          minHeight: "70vh",
        },
      }}
    >
      {/* Header with title and close button */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #404040",
          pb: 2,
        }}
      >
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Task Details
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#fff",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Scrollable content */}
      <DialogContent sx={{ pt: 3, pb: 3 }}>
        {/* BASIC INFORMATION */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#999",
            fontWeight: 600,
            letterSpacing: "0.5px",
            mb: 2,
          }}
        >
          BASIC INFORMATION
        </Typography>

        <Box sx={{ mb: 4 }}>
          <DetailRow label="URL" value={task.url} />
          <DetailRow label="Task Type" value={taskTypeDisplay} />
          <DetailRow label="Frequency" value={frequencyDisplay} />
          <DetailRow label="Depth" value={depthDisplay} />
          <DetailRow label="Priority" value={getPriorityLabel(task.priority)} />
          <DetailRow label="Country" value={task.country || "-"} />
          <DetailRow label="Zone" value={task.zone || "R"} />
        </Box>

        {/* ADVANCED SETTINGS */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#999",
            fontWeight: 600,
            letterSpacing: "0.5px",
            mb: 2,
          }}
        >
          ADVANCED SETTINGS
        </Typography>

        <Box sx={{ mb: 4 }}>
          <DetailRow label="Collection Start Date/Time" value={collectionStartDisplay} />
          <DetailRow label="Collection End Date/Time" value={collectionEndDisplay} />
        </Box>

        {/* STATUS INFORMATION */}
        <Typography
          variant="subtitle2"
          sx={{
            color: "#999",
            fontWeight: 600,
            letterSpacing: "0.5px",
            mb: 2,
          }}
        >
          STATUS INFORMATION
        </Typography>

        <Box sx={{ mb: 4 }}>
          <DetailRow label="Collection Status" value={collectionStatusDisplay} />
          <DetailRow label="Last Collected" value={lastCollectedDisplay} />
        </Box>

        {/* TASKING HISTORY */}
        {taskingHistory.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              sx={{
                color: "#999",
                fontWeight: 600,
                letterSpacing: "0.5px",
                mb: 2,
              }}
            >
              TASKING HISTORY
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                bgcolor: "#1a1a1a",
                boxShadow: "none",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "#999",
                        borderBottom: "1px solid #404040",
                        fontWeight: 600,
                      }}
                    >
                      Collection Time
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#999",
                        borderBottom: "1px solid #404040",
                        fontWeight: 600,
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taskingHistory.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          color: "#fff",
                          borderBottom:
                            index === taskingHistory.length - 1 ? "none" : "1px solid #404040",
                        }}
                      >
                        {entry.time}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#fff",
                          borderBottom:
                            index === taskingHistory.length - 1 ? "none" : "1px solid #404040",
                        }}
                      >
                        {entry.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          borderTop: "1px solid #404040",
          pt: 2,
          pb: 2,
          px: 3,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: "#404040",
            color: "#fff",
            textTransform: "none",
            "&:hover": {
              bgcolor: "#505050",
            },
          }}
        >
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Helper component for detail rows
interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow(props: DetailRowProps): JSX.Element {
  const { label, value } = props;

  return (
    <Box
      sx={{
        display: "flex",
        py: 1.5,
        borderBottom: "1px solid #404040",
        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      <Typography
        sx={{
          width: "250px",
          color: "#aaa",
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          color: "#fff",
          flex: 1,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default TaskDetailsDialog;

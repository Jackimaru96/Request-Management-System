import { JSX, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Task, RequestType, Priority, Depth } from "../types";

// ISO Country names - using a subset for now, can be expanded with a library
const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "India",
  "Brazil",
  "China",
  "South Korea",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Belgium",
  "Austria",
  "Norway",
  "Denmark",
  "Finland",
  "Ireland",
  "New Zealand",
  "Mexico",
].sort();

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, "id" | "status" | "lastCollected" | "changeStatus">) => void;
}

function AddTaskDialog(props: AddTaskDialogProps): JSX.Element {
  const { open, onClose, onAddTask } = props;

  // Form state
  const [url, setUrl] = useState("");
  const [taskType, setTaskType] = useState<"RECURRING" | "ADHOC" | "LIVESTREAM">("ADHOC");
  const [depthType, setDepthType] = useState<"lastHours" | "lastDays" | "dateRange">("lastHours");
  const [lastXDays, setLastXDays] = useState(7);
  const [dateRangeStart, setDateRangeStart] = useState<Date>(new Date());
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Priority>("Medium");
  const [country, setCountry] = useState("");
  const [frequency, setFrequency] = useState(1);
  const [cutOffTime, setCutOffTime] = useState(24);
  const [collectionStartDate, setCollectionStartDate] = useState<Date>(new Date());
  const [collectionEndDate, setCollectionEndDate] = useState<Date | null>(null);
  const [collectPopularOnly, setCollectPopularOnly] = useState(false);
  const [collectPostsOnly, setCollectPostsOnly] = useState(false);

  const handleClose = (): void => {
    // Reset form
    setUrl("");
    setTaskType("ADHOC");
    setDepthType("lastHours");
    setLastXDays(7);
    setDateRangeStart(new Date());
    setDateRangeEnd(null);
    setPriority("Medium");
    setCountry("");
    setFrequency(1);
    setCutOffTime(24);
    setCollectionStartDate(new Date());
    setCollectionEndDate(null);
    setCollectPopularOnly(false);
    setCollectPostsOnly(false);
    onClose();
  };

  const handleAddTask = (): void => {
    // Validate required fields
    if (!url.trim()) {
      alert("URL is required");
      return;
    }

    // Build depth object
    let depth: Depth;
    if (depthType === "lastHours") {
      depth = { type: "lastHours", hours: 2 };
    } else if (depthType === "lastDays") {
      depth = { type: "lastDays", days: lastXDays };
    } else {
      depth = {
        type: "dateRange",
        startDate: dateRangeStart,
        endDate: dateRangeEnd || undefined,
      };
    }

    // Map UI task type to database field
    const requestTypeMap: Record<string, RequestType> = {
      RECURRING: "Recurring",
      ADHOC: "Ad-Hoc",
      LIVESTREAM: "Livestream",
    };

    const newTask: Omit<Task, "id" | "status" | "lastCollected" | "changeStatus"> = {
      url: url.trim(),
      requestType: requestTypeMap[taskType],
      frequency: taskType === "RECURRING" ? frequency : 0,
      cutOffTime: taskType === "LIVESTREAM" ? cutOffTime : undefined,
      depth,
      priority,
      country,
    };

    onAddTask(newTask);
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          Add Task Manually
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Box 1: URL and Quick Start */}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              mb: 2,
            }}
          >
            {/* URL */}
            <TextField
              fullWidth
              required
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              sx={{ mb: 2 }}
            />

            {/* Quick Start Buttons */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setTaskType("ADHOC");
                  setDepthType("lastHours");
                  setPriority("Medium");
                }}
              >
                Quick Start
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setTaskType("ADHOC");
                  setDepthType("lastHours");
                }}
              >
                One-time
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setTaskType("RECURRING");
                  setDepthType("lastHours");
                }}
              >
                Recurring (Timely)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setTaskType("RECURRING");
                  setDepthType("dateRange");
                }}
              >
                Recurring (Complete)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setTaskType("LIVESTREAM");
                  setDepthType("dateRange");
                }}
              >
                Livestream
              </Button>
            </Box>
          </Box>

          {/* Box 2: Task Type, Frequency, and Depth */}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              mb: 2,
            }}
          >
            {/* Task Type */}
            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <FormLabel component="legend">Task Type</FormLabel>
              <RadioGroup
                row
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as typeof taskType)}
              >
                <FormControlLabel value="ADHOC" control={<Radio />} label="One-time" />
                <FormControlLabel value="RECURRING" control={<Radio />} label="Recurring" />
                <FormControlLabel value="LIVESTREAM" control={<Radio />} label="Livestream" />
              </RadioGroup>
            </FormControl>

            {/* Frequency (only for Recurring) */}
            {taskType === "RECURRING" && (
              <TextField
                fullWidth
                type="number"
                label="Frequency (hours)"
                value={frequency}
                onChange={(e) => setFrequency(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                sx={{ mb: 2 }}
              />
            )}

            {/* Cut-off time (only for Livestream) */}
            {taskType === "LIVESTREAM" && (
              <TextField
                fullWidth
                type="number"
                label="Cut-off time (hours)"
                value={cutOffTime}
                onChange={(e) => setCutOffTime(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
              />
            )}

            {/* Depth (not shown for Livestream) */}
            {taskType !== "LIVESTREAM" && (
              <>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Depth</FormLabel>
                  <RadioGroup
                    value={depthType}
                    onChange={(e) => setDepthType(e.target.value as typeof depthType)}
                  >
                    <FormControlLabel value="lastHours" control={<Radio />} label="Last 2 hours" />
                    <FormControlLabel
                      value="lastDays"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>Last X days</span>
                        </Box>
                      }
                    />
                    <FormControlLabel value="dateRange" control={<Radio />} label="Date range" />
                  </RadioGroup>
                </FormControl>

                {/* Last X Days Input */}
                {depthType === "lastDays" && (
                  <TextField
                    type="number"
                    size="small"
                    value={lastXDays}
                    onChange={(e) => setLastXDays(Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ min: 1 }}
                    sx={{ ml: 4, mt: 1, width: "100px" }}
                  />
                )}

                {/* Date Range Fields */}
                {depthType === "dateRange" && (
                  <Box sx={{ mt: 2, ml: 4 }}>
                    <DateTimePicker
                      label="Start Date & Time"
                      value={dateRangeStart}
                      onChange={(newValue) => setDateRangeStart(newValue || new Date())}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal",
                        },
                      }}
                    />
                    <DateTimePicker
                      label="End Date & Time (Optional)"
                      value={dateRangeEnd}
                      onChange={(newValue) => setDateRangeEnd(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal",
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Box 3: Priority and Country */}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              mb: 2,
            }}
          >
            {/* Priority */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Priority</FormLabel>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <MenuItem value="Urgent">Urgent</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>

            {/* Country */}
            <FormControl fullWidth>
              <FormLabel>Country (Optional)</FormLabel>
              <Select value={country} onChange={(e) => setCountry(e.target.value)} displayEmpty>
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {COUNTRIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Advanced Settings */}
          <Accordion
            sx={{
              mt: 2,
              bgcolor: "inherit",
              boxShadow: "none",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "inherit",
                minHeight: 48,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Typography>Advanced Settings</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                bgcolor: "inherit",
                pt: 2,
              }}
            >
              {/* Collection Period */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Collection Period
                </Typography>
                <DateTimePicker
                  label="Start Date & Time"
                  value={collectionStartDate}
                  onChange={(newValue) => setCollectionStartDate(newValue || new Date())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                    },
                  }}
                />
                <DateTimePicker
                  label="End Date & Time (Optional)"
                  value={collectionEndDate}
                  onChange={(newValue) => setCollectionEndDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                    },
                  }}
                />
              </Box>

              {/* Content Options */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Content Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={collectPopularOnly}
                      onChange={(e) => setCollectPopularOnly(e.target.checked)}
                    />
                  }
                  label="Collect popular posts only"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={collectPostsOnly}
                      onChange={(e) => setCollectPostsOnly(e.target.checked)}
                    />
                  }
                  label="Collect posts only"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAddTask} variant="contained" disabled={!url.trim()}>
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default AddTaskDialog;

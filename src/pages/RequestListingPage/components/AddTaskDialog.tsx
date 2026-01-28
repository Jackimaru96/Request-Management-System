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
import {
  RequestType,
  Priority,
  DepthType,
  CreateTaskFormInput,
  CreateTaskApiPayload,
  mapCreateTaskFormToApi,
} from "../types";

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
  onAddTask: (payload: CreateTaskApiPayload) => void;
}

function AddTaskDialog(props: AddTaskDialogProps): JSX.Element {
  const { open, onClose, onAddTask } = props;

  // Form state
  const [url, setUrl] = useState("");
  const [requestType, setRequestType] = useState<RequestType>(RequestType.ADHOC);
  const [depthType, setDepthType] = useState<DepthType>(DepthType.LAST_HOURS);
  const [lastXDays, setLastXDays] = useState(7);
  const [dateRangeStart, setDateRangeStart] = useState<Date>(new Date());
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [country, setCountry] = useState("");
  const [recurringFreq, setRecurringFreq] = useState(1);
  const [cutOffTime, setCutOffTime] = useState<Date | null>(null);
  const [collectionStartDate, setCollectionStartDate] = useState<Date>(new Date());
  const [collectionEndDate, setCollectionEndDate] = useState<Date | null>(null);
  const [collectPopularOnly, setCollectPopularOnly] = useState(false);

  const handleClose = (): void => {
    // Reset form
    setUrl("");
    setRequestType(RequestType.ADHOC);
    setDepthType(DepthType.LAST_HOURS);
    setLastXDays(7);
    setDateRangeStart(new Date());
    setDateRangeEnd(null);
    setPriority(Priority.MEDIUM);
    setCountry("");
    setRecurringFreq(1);
    const date = new Date();
    date.setHours(date.getHours() + 24);
    setCutOffTime(date);
    setCollectionStartDate(new Date());
    setCollectionEndDate(null);
    setCollectPopularOnly(false);
    onClose();
  };

  const handleAddTask = (): void => {
    // Validate required fields
    if (!url.trim()) {
      alert("URL is required");
      return;
    }

    // Determine backcrawl fields based on depth type selection
    let backcrawlDepthDays: number | undefined;
    let backcrawlStartTime: Date | undefined;
    let backcrawlEndTime: Date | undefined;

    if (depthType === DepthType.LAST_DAYS) {
      backcrawlDepthDays = lastXDays;
    } else if (depthType === DepthType.DATE_RANGE) {
      backcrawlStartTime = dateRangeStart;
      backcrawlEndTime = dateRangeEnd || undefined;
    }
    // For LAST_HOURS, no backcrawl fields are set (default behavior)

    // Build form input with Date objects (UI layer)
    const formInput: CreateTaskFormInput = {
      url: url.trim(),
      requestType: requestType,
      priority,

      // Backcrawl fields based on depth type
      backcrawlDepthDays,
      backcrawlStartTime,
      backcrawlEndTime,

      // Other optional fields
      country: country || undefined,
      cutOffTime: requestType === RequestType.LIVESTREAM ? cutOffTime || undefined : undefined,
      endCollectionTime:
        requestType === RequestType.RECURRING ? collectionEndDate || undefined : undefined,
      isAlwaysRun: false,
      isCollectPopularPostOnly: collectPopularOnly,
      recurringFreqHours: requestType === RequestType.RECURRING ? recurringFreq : undefined,
      startCollectionTime: collectionStartDate,
      tags: [],
      title: undefined,
    };

    // Convert Date objects to ISO strings using the mapper
    // This is the SINGLE place where Date → ISO conversion happens
    const apiPayload = mapCreateTaskFormToApi(formInput);

    // TODO: Update with real API
    // The apiPayload is ready to be sent to the backend API
    // All date fields are now ISO timestamp strings
    onAddTask(apiPayload);
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
                  setRequestType(RequestType.ADHOC);
                  setDepthType(DepthType.LAST_HOURS);
                  setPriority(Priority.MEDIUM);
                }}
              >
                Quick Start
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setRequestType(RequestType.ADHOC);
                  setDepthType(DepthType.LAST_HOURS);
                }}
              >
                One-time
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setRequestType(RequestType.RECURRING);
                  setDepthType(DepthType.LAST_HOURS);
                }}
              >
                Recurring (Timely)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setRequestType(RequestType.RECURRING);
                  setDepthType(DepthType.DATE_RANGE);
                }}
              >
                Recurring (Complete)
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setRequestType(RequestType.LIVESTREAM);
                  setDepthType(DepthType.DATE_RANGE);
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
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as RequestType)}
              >
                <FormControlLabel value={RequestType.ADHOC} control={<Radio />} label="One-time" />
                <FormControlLabel
                  value={RequestType.RECURRING}
                  control={<Radio />}
                  label="Recurring"
                />
                <FormControlLabel
                  value={RequestType.LIVESTREAM}
                  control={<Radio />}
                  label="Livestream"
                />
              </RadioGroup>
            </FormControl>

            {/* Frequency (only for Recurring) */}
            {requestType === RequestType.RECURRING && (
              <TextField
                fullWidth
                type="number"
                label="Frequency (hours)"
                value={recurringFreq}
                onChange={(e) => setRecurringFreq(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1 }}
                sx={{ mb: 2 }}
              />
            )}

            {/* Cut-off time (only for Livestream) */}
            {requestType === RequestType.LIVESTREAM && (
              <DateTimePicker
                label="Cut-off Time"
                value={cutOffTime}
                onChange={(newValue) => setCutOffTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            )}

            {/* Depth (not shown for Livestream) */}
            {requestType !== RequestType.LIVESTREAM && (
              <>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Depth</FormLabel>
                  <RadioGroup
                    value={depthType}
                    onChange={(e) => setDepthType(e.target.value as DepthType)}
                  >
                    <FormControlLabel
                      value={DepthType.LAST_HOURS}
                      control={<Radio />}
                      label="Last 2 hours"
                    />
                    <FormControlLabel
                      value={DepthType.LAST_DAYS}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>Last X days</span>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value={DepthType.DATE_RANGE}
                      control={<Radio />}
                      label="Date range"
                    />
                  </RadioGroup>
                </FormControl>

                {/* Last X Days Input */}
                {depthType === DepthType.LAST_DAYS && (
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
                {depthType === DepthType.DATE_RANGE && (
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
              <Select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as Priority)}
              >
                <MenuItem value={Priority.URGENT}>Urgent</MenuItem>
                <MenuItem value={Priority.HIGH}>High</MenuItem>
                <MenuItem value={Priority.MEDIUM}>Medium</MenuItem>
                <MenuItem value={Priority.LOW}>Low</MenuItem>
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

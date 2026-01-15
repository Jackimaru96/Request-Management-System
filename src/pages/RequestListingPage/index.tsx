import { JSX, useState, useMemo } from "react";
import { Box, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { NdsDataGrid, GridColDef, type NdsBaseSelectOption } from "@nautilus/nds-react";
import { Task, TaskDisplay, ChangeStatus } from "./types";
import { tasksToDisplay } from "./helpers";
import AddTasksDialog from "./components/AddTasksDialog";
import AddTaskDialog from "./components/AddTaskDialog";

function RequestListingPage(): JSX.Element {
  const [quickFilterSearch, setQuickFilterSearch] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState<NdsBaseSelectOption[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<NdsBaseSelectOption[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [addTasksDialogOpen, setAddTasksDialogOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);

  // Task data with proper types - use state to allow adding new tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      url: "api.example.com/v1/climate-data",
      requestType: "Recurring",
      frequency: 3,
      depth: { type: "lastHours", hours: 2 },
      priority: "Urgent",
      country: "United States",
      status: "",
      lastCollected: null,
      changeStatus: "added",
    },
    {
      id: "2",
      url: "metrics-api.cloud/collection",
      requestType: "Recurring",
      frequency: 3,
      depth: { type: "lastHours", hours: 2 },
      priority: "High",
      country: "Australia",
      status: "",
      lastCollected: null,
      changeStatus: "added",
    },
    {
      id: "3",
      url: "weather-data.science/metrics",
      requestType: "Recurring",
      frequency: 2,
      depth: { type: "lastHours", hours: 2 },
      priority: "Medium",
      country: "United Kingdom",
      status: "Collected",
      lastCollected: new Date("2026-01-14T08:45:00"),
      changeStatus: "deleted",
    },
    {
      id: "4",
      url: "global-climate.net/sensors",
      requestType: "Recurring",
      frequency: 1,
      depth: { type: "lastHours", hours: 2 },
      priority: "Urgent",
      country: "Singapore",
      status: "Collecting",
      lastCollected: new Date("2026-01-14T10:45:00"),
      changeStatus: "confirmed",
    },
    {
      id: "5",
      url: "climate-monitor.global/api/temp",
      requestType: "Ad-Hoc",
      frequency: 0,
      depth: { type: "lastDays", days: 2 },
      priority: "High",
      country: "Germany",
      status: "Collecting",
      lastCollected: new Date("2026-01-14T09:15:00"),
      changeStatus: "confirmed",
    },
    {
      id: "6",
      url: "environment-tracker.io/data",
      requestType: "Recurring",
      frequency: 4,
      depth: { type: "lastDays", days: 3 },
      priority: "High",
      country: "Japan",
      status: "Collected",
      lastCollected: new Date("2026-01-14T07:20:00"),
      changeStatus: "confirmed",
    },
    {
      id: "7",
      url: "temperature-monitor.io/latest",
      requestType: "Recurring",
      frequency: 2,
      depth: { type: "lastHours", hours: 2 },
      priority: "High",
      country: "France",
      status: "Collecting",
      lastCollected: new Date("2026-01-14T10:00:00"),
      changeStatus: "confirmed",
    },
    {
      id: "8",
      url: "eco-sensors.worldwide/api",
      requestType: "Livestream",
      frequency: 0,
      cutOffTime: 24,
      depth: {
        type: "dateRange",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      },
      priority: "Medium",
      country: "Canada",
      status: "Collected",
      lastCollected: new Date("2026-01-14T05:30:00"),
      changeStatus: "confirmed",
    },
    {
      id: "9",
      url: "data-hub.research.org/endpoints",
      requestType: "Ad-Hoc",
      frequency: 0,
      depth: { type: "lastDays", days: 2 },
      priority: "Medium",
      country: "India",
      status: "Uploaded",
      lastCollected: new Date("2026-01-14T04:15:00"),
      changeStatus: "confirmed",
    },
    {
      id: "10",
      url: "atmospheric-data.org/readings",
      requestType: "Recurring",
      frequency: 8,
      depth: { type: "lastDays", days: 4 },
      priority: "Low",
      country: "Brazil",
      status: "Uploaded",
      lastCollected: new Date("2026-01-14T06:00:00"),
      changeStatus: null,
    },
  ]);

  // Convert tasks to display format
  const rows: TaskDisplay[] = useMemo(() => tasksToDisplay(tasks), [tasks]);

  // Calculate if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return tasks.some((task) => task.changeStatus === "added" || task.changeStatus === "deleted");
  }, [tasks]);

  // Count pending changes
  const pendingChangesCount = useMemo(() => {
    return tasks.filter((task) => task.changeStatus === "added" || task.changeStatus === "deleted")
      .length;
  }, [tasks]);

  // Handle adding a new task
  const handleAddTask = (
    newTask: Omit<Task, "id" | "status" | "lastCollected" | "changeStatus">,
  ): void => {
    // Generate a temporary ID (in real app, this would come from the API)
    const newId = `temp-${Date.now()}`;

    const taskToAdd: Task = {
      ...newTask,
      id: newId,
      status: "",
      lastCollected: null,
      changeStatus: "added", // Mark as newly added (shows green plus icon)
    };

    // Add the new task to the beginning of the list
    setTasks([taskToAdd, ...tasks]);

    // TODO: Make API call to persist the task to the backend
    // After API success, update the task with the real ID from the server
  };

  const columns: GridColDef[] = [
    {
      field: "changeStatus",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params): JSX.Element | null => {
        const changeStatus = params.value as ChangeStatus;

        if (changeStatus === "added") {
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AddIcon sx={{ color: "success.main" }} />
            </Box>
          );
        }

        if (changeStatus === "deleted") {
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RemoveIcon sx={{ color: "error.main" }} />
            </Box>
          );
        }

        if (changeStatus === "confirmed") {
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiberManualRecordIcon sx={{ color: "primary.main", fontSize: "12px" }} />
            </Box>
          );
        }

        return null;
      },
    },
    {
      field: "url",
      headerName: "URL",
      flex: 2.5,
      minWidth: 250,
    },
    {
      field: "taskType",
      headerName: "Task Type",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1.2,
      minWidth: 140,
    },
    {
      field: "depth",
      headerName: "Depth",
      flex: 1.5,
      minWidth: 150,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params): JSX.Element => {
        const priority = params.value as string;
        const priorityColors: Record<string, { bg: string; text: string }> = {
          Urgent: { bg: "#d32f2f", text: "#fff" },
          High: { bg: "#ed6c02", text: "#fff" },
          Medium: { bg: "#0288d1", text: "#fff" },
          Low: { bg: "#2e7d32", text: "#fff" },
        };

        const colors = priorityColors[priority] || { bg: "#757575", text: "#fff" };

        return (
          <Chip label={priority} size="small" sx={{ bgcolor: colors.bg, color: colors.text }} />
        );
      },
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1.2,
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "lastCollected",
      headerName: "Last Collected",
      flex: 1.5,
      minWidth: 180,
    },
  ];

  return (
    <Box sx={{ padding: "32px 64px 16px 64px" }}>
      <NdsDataGrid
        disableRowSelectionOnClick
        rows={rows}
        columns={columns}
        tableTitle="TMS"
        primaryButton={{
          label: "Add Tasks",
          onClick: (): void => {
            setAddTasksDialogOpen(true);
          },
        }}
        toolbarButtons={
          hasPendingChanges
            ? [
                {
                  label: `Review Changes (${pendingChangesCount})`,
                  onClick: (): void => {
                    // TODO: Open review changes dialog
                  },
                },
              ]
            : []
        }
        menuItems={[
          {
            label: "Edit",
            icon: <EditIcon color="action" />,
            onClick: (params: TaskDisplay): void => {
              // TODO: Open edit dialog
              console.log("Edit", params);
            },
          },
          {
            label: "Delete",
            icon: <DeleteIcon color="action" />,
            onClick: (params: TaskDisplay): void => {
              // TODO: Open delete confirmation dialog
              console.log("Delete", params);
            },
          },
          {
            label: "Duplicate",
            icon: <ContentCopyIcon color="action" />,
            onClick: (params: TaskDisplay): void => {
              // TODO: Open duplicate dialog
              console.log("Duplicate", params);
            },
          },
        ]}
        rowMenu
        checkboxSelection
        rowCount={rows.length}
        pageSizeOptions={[10, 25, 50]}
        paginationMode="client"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        filters={[
          {
            type: "QuickFilter",
            props: {
              value: quickFilterSearch,
              onChange: setQuickFilterSearch,
            },
          },
          {
            type: "MultiSelect",
            props: {
              label: "Task Type",
              options: [{ title: "Recurring" }, { title: "Ad-Hoc" }, { title: "Livestream" }],
              value: taskTypeFilter,
              onChange: setTaskTypeFilter,
            },
          },
          {
            type: "MultiSelect",
            props: {
              label: "Priority",
              options: [
                { title: "Urgent" },
                { title: "High" },
                { title: "Medium" },
                { title: "Low" },
              ],
              value: priorityFilter,
              onChange: setPriorityFilter,
            },
          },
        ]}
      />

      {/* Add Tasks Dialog (File Upload) */}
      <AddTasksDialog
        open={addTasksDialogOpen}
        onClose={() => setAddTasksDialogOpen(false)}
        onManualAdd={() => setAddTaskDialogOpen(true)}
      />

      {/* Add Task Dialog (Manual Entry) */}
      <AddTaskDialog
        open={addTaskDialogOpen}
        onClose={() => setAddTaskDialogOpen(false)}
        onAddTask={handleAddTask}
      />
    </Box>
  );
}

export default RequestListingPage;

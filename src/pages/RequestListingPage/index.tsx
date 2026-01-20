import { JSX, useState, useMemo } from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { NdsDataGrid, GridColDef, type NdsBaseSelectOption } from "@nautilus/nds-react";
import {
  Task,
  TaskDisplay,
  ChangeStatus,
  RequestType,
  RequestStatus,
  Priority,
  DepthType,
} from "./types";
import { tasksToDisplay } from "./helpers";
import AddTasksStagingDialog from "./components/AddTasksStagingDialog";

function RequestListingPage(): JSX.Element {
  const [quickFilterSearch, setQuickFilterSearch] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState<NdsBaseSelectOption[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<NdsBaseSelectOption[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [addTasksDialogOpen, setAddTasksDialogOpen] = useState(false);

  // Task data with proper types - use state to allow adding new tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      url: "api.example.com/v1/climate-data",
      requestType: RequestType.RECURRING,
      recurringFreq: 3,
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      priority: Priority.URGENT,
      country: "United States",
      status: RequestStatus.CREATED,
      createdTime: new Date("2026-01-15T10:00:00"),
      user: "user123",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.ADDED,
    },
    {
      id: "2",
      url: "metrics-api.cloud/collection",
      requestType: RequestType.RECURRING,
      recurringFreq: 3,
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      priority: Priority.HIGH,
      country: "Australia",
      status: RequestStatus.CREATED,
      createdTime: new Date("2026-01-15T10:00:00"),
      user: "user123",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.ADDED,
    },
    {
      id: "3",
      url: "weather-data.science/metrics",
      requestType: RequestType.RECURRING,
      recurringFreq: 2,
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      priority: Priority.MEDIUM,
      country: "United Kingdom",
      status: RequestStatus.APPROVED,
      createdTime: new Date("2026-01-14T08:45:00"),
      user: "user456",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.DELETED,
    },
    {
      id: "4",
      url: "global-climate.net/sensors",
      requestType: RequestType.RECURRING,
      recurringFreq: 1,
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      priority: Priority.URGENT,
      country: "Singapore",
      status: RequestStatus.APPROVED,
      createdTime: new Date("2026-01-14T10:45:00"),
      user: "user789",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "5",
      url: "climate-monitor.global/api/temp",
      requestType: RequestType.ADHOC,
      depth: { type: DepthType.LAST_DAYS, days: 2 },
      priority: Priority.HIGH,
      country: "Germany",
      status: RequestStatus.APPROVED,
      createdTime: new Date("2026-01-14T09:15:00"),
      user: "user123",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "6",
      url: "environment-tracker.io/data",
      requestType: RequestType.RECURRING,
      recurringFreq: 4,
      depth: { type: DepthType.LAST_DAYS, days: 3 },
      priority: Priority.HIGH,
      country: "Japan",
      status: RequestStatus.APPROVED,
      createdTime: new Date("2026-01-14T07:20:00"),
      user: "user456",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "7",
      url: "temperature-monitor.io/latest",
      requestType: RequestType.RECURRING,
      recurringFreq: 2,
      depth: { type: DepthType.LAST_HOURS, hours: 2 },
      priority: Priority.HIGH,
      country: "France",
      status: RequestStatus.APPROVED,
      createdTime: new Date("2026-01-14T10:00:00"),
      user: "user789",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "8",
      url: "eco-sensors.worldwide/api",
      requestType: RequestType.LIVESTREAM,
      cutOffTime: new Date("2026-01-31T23:59:59"),
      depth: {
        type: DepthType.DATE_RANGE,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
      },
      priority: Priority.MEDIUM,
      country: "Canada",
      status: RequestStatus.APPROVED,
      createdTime: new Date("2026-01-14T05:30:00"),
      user: "user123",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.PENDING_UPLOAD,
    },
    {
      id: "9",
      url: "data-hub.research.org/endpoints",
      requestType: RequestType.ADHOC,
      depth: { type: DepthType.LAST_DAYS, days: 2 },
      priority: Priority.MEDIUM,
      country: "India",
      status: RequestStatus.DOWNLOADED,
      createdTime: new Date("2026-01-14T04:15:00"),
      user: "user456",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: ChangeStatus.UPLOADED,
    },
    {
      id: "10",
      url: "atmospheric-data.org/readings",
      requestType: RequestType.RECURRING,
      recurringFreq: 8,
      depth: { type: DepthType.LAST_DAYS, days: 4 },
      priority: Priority.LOW,
      country: "Brazil",
      status: RequestStatus.APPROVED,
      createdTime: new Date("2026-01-14T06:00:00"),
      user: "user789",
      userGroup: "analysts",
      contentType: "post",
      mediaPlatform: "web",
      mediaType: "social",
      estimatedColDuration: 60,
      changeStatus: null,
    },
  ]);

  // Convert tasks to display format
  const rows: TaskDisplay[] = useMemo(() => tasksToDisplay(tasks), [tasks]);

  // Calculate if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return tasks.some(
      (task) => task.changeStatus === ChangeStatus.ADDED || task.changeStatus === ChangeStatus.DELETED
    );
  }, [tasks]);

  // Count pending changes
  const pendingChangesCount = useMemo(() => {
    return tasks.filter(
      (task) => task.changeStatus === ChangeStatus.ADDED || task.changeStatus === ChangeStatus.DELETED
    ).length;
  }, [tasks]);

  // Handle adding multiple tasks
  const handleAddTasks = (
    newTasks: Omit<Task, "id" | "status" | "createdTime" | "user" | "userGroup" | "changeStatus">[]
  ): void => {
    const tasksToAdd: Task[] = newTasks.map((newTask, index) => ({
      ...newTask,
      id: `temp-${Date.now()}-${index}`,
      status: RequestStatus.CREATED,
      createdTime: new Date(),
      user: "current_user", // TODO: Get from auth context
      userGroup: "default_group", // TODO: Get from auth context
      changeStatus: ChangeStatus.ADDED, // Mark as newly added (shows green plus icon)
    }));

    // Add all new tasks to the beginning of the list
    setTasks([...tasksToAdd, ...tasks]);

    // TODO: Make API call to persist the tasks to the backend
    // After API success, update the tasks with real IDs from the server
  };

  const columns: GridColDef[] = [
    {
      field: "changeStatus",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params): JSX.Element | null => {
        const changeStatus = params.value as ChangeStatus | null;

        if (changeStatus === ChangeStatus.ADDED) {
          return (
            <Tooltip title="Will be added in next export" placement="right">
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AddIcon sx={{ color: "success.main" }} />
              </Box>
            </Tooltip>
          );
        }

        if (changeStatus === ChangeStatus.DELETED) {
          return (
            <Tooltip title="Will be deleted in next export" placement="right">
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RemoveIcon sx={{ color: "error.main" }} />
              </Box>
            </Tooltip>
          );
        }

        if (changeStatus === ChangeStatus.PENDING_UPLOAD) {
          return (
            <Tooltip title="Pending XML upload to W" placement="right">
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FiberManualRecordIcon sx={{ color: "primary.main", fontSize: "12px" }} />
              </Box>
            </Tooltip>
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

      {/* Add Tasks Dialog with Staging */}
      <AddTasksStagingDialog
        open={addTasksDialogOpen}
        onClose={() => setAddTasksDialogOpen(false)}
        onAddTasks={handleAddTasks}
      />
    </Box>
  );
}

export default RequestListingPage;

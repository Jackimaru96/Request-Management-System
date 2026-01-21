import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import HistoryIcon from "@mui/icons-material/History";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import { GridColDef, NdsDataGrid, type NdsBaseSelectOption } from "@nautilus/nds-react";
import { JSX, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useCreateTaskMutation, useDeleteTaskMutation, useTasksQuery } from "../../queries/tasks";
import { priorityColors } from "../../utils/colours";
import AddTasksStagingDialog from "./components/AddTasksStagingDialog";
import DeleteTaskDialog from "./components/DeleteTaskDialog";
import { tasksToDisplay } from "./helpers";
import { ChangeStatus, EventStatus, EventType, Task, TaskDisplay } from "./types";

function RequestListingPage(): JSX.Element {
  const navigate = useNavigate();
  const [quickFilterSearch, setQuickFilterSearch] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState<NdsBaseSelectOption[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<NdsBaseSelectOption[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });
  const [addTasksDialogOpen, setAddTasksDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskDisplay | null>(null);

  // Use React Query to fetch tasks
  const { data: tasks = [] } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  // Convert tasks to display format
  const rows: TaskDisplay[] = useMemo(() => tasksToDisplay(tasks), [tasks]);

  // Calculate if there are pending changes
  // Pending changes = tasks with LOCAL events (ADDED or DELETED status)
  const hasPendingChanges = useMemo(() => {
    return tasks.some(
      (task: Task) =>
        task.changeStatus === ChangeStatus.ADDED || task.changeStatus === ChangeStatus.DELETED,
    );
  }, [tasks]);

  // Count pending changes (number of LOCAL events pending export)
  const pendingChangesCount = useMemo(() => {
    return tasks.filter(
      (task: Task) =>
        task.changeStatus === ChangeStatus.ADDED || task.changeStatus === ChangeStatus.DELETED,
    ).length;
  }, [tasks]);

  // Handle adding multiple tasks using React Query mutation
  const handleAddTasks = (
    newTasks: Omit<
      Task,
      | "id"
      | "createdTime"
      | "user"
      | "userGroup"
      | "version"
      | "changeStatus"
      | "latestEvent"
      | "collectionStatus"
      | "colEndTime"
      | "estimatedColDuration"
    >[],
  ): void => {
    // Create each task using the mutation
    // The mutation will handle optimistic updates and add to cache
    newTasks.forEach((newTask) => {
      createTaskMutation.mutate(newTask);
    });
  };

  // Handle delete task
  const handleDeleteTask = (taskDisplay: TaskDisplay): void => {
    setTaskToDelete(taskDisplay);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = (): void => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id);
    }
    setTaskToDelete(null);
  };

  // Helper to check if task is pending deletion upload (DELETE event with PENDING_UPLOAD status)
  const isPendingDeletionUpload = (taskId: string): boolean => {
    const task = tasks.find((t: Task) => t.id === taskId);
    return !!(
      task?.latestEvent &&
      task.latestEvent.eventType === EventType.DELETE &&
      task.latestEvent.status === EventStatus.PENDING_UPLOAD
    );
  };

  const columns: GridColDef[] = [
    {
      field: "changeStatus",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params): JSX.Element | null => {
        const changeStatus = params.value as ChangeStatus | null;

        if (changeStatus === ChangeStatus.ADDED) {
          return (
            <Tooltip title="Will be added in next export" placement="right">
              <AddIcon sx={{ color: "success.main", fontSize: "1rem" }} />
            </Tooltip>
          );
        }

        if (changeStatus === ChangeStatus.DELETED) {
          return (
            <Tooltip title="Will be deleted in next export" placement="right">
              <RemoveIcon sx={{ color: "error.main", fontSize: "1rem" }} />
            </Tooltip>
          );
        }

        if (changeStatus === ChangeStatus.PENDING_UPLOAD) {
          return (
            <Tooltip title="Pending XML upload to W" placement="right">
              <FiberManualRecordIcon sx={{ color: "primary.main", fontSize: "0.8rem" }} />
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
      renderCell: (params): JSX.Element => {
        const isPendingDeletion = isPendingDeletionUpload(params.row.id as string);
        return (
          <span style={{ textDecoration: isPendingDeletion ? "line-through" : "none" }}>
            {params.value as string}
          </span>
        );
      },
    },
    {
      field: "taskType",
      headerName: "Task Type",
      flex: 1,
      minWidth: 120,
      renderCell: (params): JSX.Element => {
        const isPendingDeletion = isPendingDeletionUpload(params.row.id as string);
        return (
          <span style={{ textDecoration: isPendingDeletion ? "line-through" : "none" }}>
            {params.value as string}
          </span>
        );
      },
    },
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1.2,
      minWidth: 140,
      renderCell: (params): JSX.Element => {
        const isPendingDeletion = isPendingDeletionUpload(params.row.id as string);
        return (
          <span style={{ textDecoration: isPendingDeletion ? "line-through" : "none" }}>
            {params.value as string}
          </span>
        );
      },
    },
    {
      field: "depth",
      headerName: "Depth",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params): JSX.Element => {
        const isPendingDeletion = isPendingDeletionUpload(params.row.id as string);
        return (
          <span style={{ textDecoration: isPendingDeletion ? "line-through" : "none" }}>
            {params.value as string}
          </span>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params): JSX.Element => {
        const priority = params.value as string;
        const colors = priorityColors[priority] || { bg: "#757575", text: "#fff" };
        const isPendingDeletion = isPendingDeletionUpload(params.row.id as string);

        return (
          <Chip
            label={priority}
            size="small"
            sx={{
              bgcolor: colors.bg,
              color: colors.text,
              textDecoration: isPendingDeletion ? "line-through" : "none",
            }}
          />
        );
      },
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1.2,
      minWidth: 150,
      renderCell: (params): JSX.Element => {
        const isPendingDeletion = isPendingDeletionUpload(params.row.id as string);
        return (
          <span style={{ textDecoration: isPendingDeletion ? "line-through" : "none" }}>
            {params.value as string}
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params): JSX.Element => {
        const isPendingDeletion = isPendingDeletionUpload(params.row.id as string);
        const displayValue = isPendingDeletion
          ? "Pending Deletion Upload"
          : (params.value as string);
        return (
          <span style={{ textDecoration: isPendingDeletion ? "line-through" : "none" }}>
            {displayValue}
          </span>
        );
      },
    },
    {
      field: "lastCollected",
      headerName: "Last Collected",
      flex: 1.5,
      minWidth: 180,
      renderCell: (params): JSX.Element => {
        const isPendingDeletion = isPendingDeletionUpload(params.row.id as string);
        return (
          <span style={{ textDecoration: isPendingDeletion ? "line-through" : "none" }}>
            {params.value as string}
          </span>
        );
      },
    },
  ];

  return (
    <Box sx={{ padding: "32px 64px 16px 64px" }}>
      {/* Page Title */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        TMS
      </Typography>

      {/* External Toolbar - Action Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* Left side - Add Tasks button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={(): void => {
            setAddTasksDialogOpen(true);
          }}
          sx={{ textTransform: "none" }}
        >
          ADD TASKS
        </Button>

        {/* Right side - History and Review Changes buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={(): void => {
              // TODO: Implement history functionality when route is available
            }}
            sx={{ textTransform: "none" }}
          >
            History
          </Button> */}

          <Tooltip
            title={!hasPendingChanges ? "No pending changes to review" : ""}
            arrow
            placement="top"
          >
            <span>
              <Button
                variant="contained"
                disabled={!hasPendingChanges}
                onClick={(): void => {
                  if (hasPendingChanges) {
                    navigate("/review-changes");
                  }
                }}
                sx={{ textTransform: "none" }}
              >
                REVIEW CHANGES ({pendingChangesCount})
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Data Grid - without primaryButton and toolbarButtons */}
      <NdsDataGrid
        disableRowSelectionOnClick
        rows={rows}
        columns={columns}
        menuItems={[
          {
            label: "Delete",
            icon: <DeleteIcon color="action" />,
            onClick: (params: TaskDisplay): void => {
              handleDeleteTask(params);
            },
          },
        ]}
        rowMenu
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

      {/* Delete Task Confirmation Dialog */}
      <DeleteTaskDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        taskUrl={taskToDelete?.url}
      />
    </Box>
  );
}

export default RequestListingPage;

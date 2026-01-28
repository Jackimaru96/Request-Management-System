import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import InfoIcon from "@mui/icons-material/Info";
import RemoveIcon from "@mui/icons-material/Remove";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, Button, Chip, Tooltip, Typography } from "@mui/material";
import {
  GridColDef,
  GridRowSelectionModel,
  NdsDataGrid,
  type NdsBaseSelectOption,
} from "@nautilus/nds-react";
import { JSX, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  useCreateTaskMutation,
  useDeleteSelectedTasksMutation,
  useTasksQuery,
} from "../../queries/tasks";
import { priorityColors, strikethroughDimmedStyle } from "../../utils/textStyling";
import AddTasksStagingDialog from "./components/AddTasksStagingDialog";
import DeleteSelectedConfirmDialog from "./components/DeleteSelectedConfirmDialog";
import TaskDetailsDialog from "./components/TaskDetailsDialog";
import { tasksToDisplay } from "./helpers";
import {
  ChangeStatus,
  CreateTaskApiPayload,
  EventStatus,
  EventType,
  Task,
  TaskDisplay,
} from "./types";

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
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [deleteSelectedDialogOpen, setDeleteSelectedDialogOpen] = useState(false);
  const [taskDetailsDialogOpen, setTaskDetailsDialogOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);

  // Use React Query to fetch tasks
  const { data: tasks = [] } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const deleteSelectedMutation = useDeleteSelectedTasksMutation();

  // Convert tasks to display format
  const rows: TaskDisplay[] = useMemo(() => tasksToDisplay(tasks), [tasks]);

  // Calculate pending updates count for "Review Updates" button
  // This includes: LOCAL, APPROVED (Changes), PENDING_UPLOAD (Exports), CONFLICT (Conflicts)
  const pendingUpdatesCount = useMemo(() => {
    return tasks.filter((task: Task) => {
      const status = task.latestEvent?.status;
      return (
        status === EventStatus.LOCAL ||
        status === EventStatus.APPROVED ||
        status === EventStatus.PENDING_UPLOAD ||
        status === EventStatus.CONFLICT
      );
    }).length;
  }, [tasks]);

  // Check if there are any pending updates to review
  const hasPendingUpdates = pendingUpdatesCount > 0;

  // ====== DELETE ELIGIBILITY (Stage 1 Rules) ======
  // Per user requirement: "Allow delete only and only applies to tasks that are PENDING_UPLOAD, or UPLOADED"
  // This means we can only delete tasks that have already been exported or uploaded

  // Get selected tasks
  const selectedTasks = useMemo(() => {
    const selectedIds = Array.from(rowSelectionModel.ids).map((id) => String(id));
    return tasks.filter((task) => selectedIds.includes(task.id));
  }, [rowSelectionModel, tasks]);

  // Check if ALL selected tasks are eligible for deletion
  // Eligible = latest event status is PENDING_UPLOAD or UPLOADED
  const deleteEligibility = useMemo(() => {
    if (selectedTasks.length === 0) {
      return { eligible: false, reason: "Select one or more tasks to delete" };
    }

    const ineligibleTasks = selectedTasks.filter((task) => {
      const status = task.latestEvent?.status;
      // Already has a DELETE event - skip
      if (task.latestEvent?.eventType === EventType.DELETE) {
        return true;
      }
      // Only PENDING_UPLOAD or UPLOADED are eligible
      return status !== EventStatus.PENDING_UPLOAD && status !== EventStatus.UPLOADED;
    });

    if (ineligibleTasks.length > 0) {
      const ineligibleCount = ineligibleTasks.length;
      return {
        eligible: false,
        reason: `${ineligibleCount} selected task(s) cannot be deleted. Only tasks pending XML upload or uploaded can be deleted.`,
      };
    }

    return { eligible: true, reason: "" };
  }, [selectedTasks]);

  // Handle adding multiple tasks using React Query mutation
  // Accepts CreateTaskApiPayload[] - all dates are already ISO strings
  const handleAddTasks = (newTasks: CreateTaskApiPayload[]): void => {
    // Create each task using the mutation
    // The mutation will handle optimistic updates and add to cache
    newTasks.forEach((newTask) => {
      console.log(newTask);
      createTaskMutation.mutate(newTask);
    });
  };

  // Handle delete selected tasks
  const handleDeleteSelected = (): void => {
    if (!deleteEligibility.eligible) {
      return;
    }
    setDeleteSelectedDialogOpen(true);
  };

  // Confirm delete selected
  const handleConfirmDeleteSelected = (): void => {
    const selectedIds = Array.from(rowSelectionModel.ids).map((id) => String(id));
    deleteSelectedMutation.mutate(selectedIds, {
      onSuccess: () => {
        // Clear selection after successful deletion
        setRowSelectionModel({ type: "include", ids: new Set() });
        setDeleteSelectedDialogOpen(false);
      },
    });
  };

  // Handle view details
  const handleViewDetails = (taskDisplay: TaskDisplay): void => {
    // Find the full task object from the tasks array
    const task = tasks.find((t) => t.id === taskDisplay.id);
    if (task) {
      setSelectedTaskForDetails(task);
      setTaskDetailsDialogOpen(true);
    }
  };

  // Helper to check if task is pending deletion (DELETE event with any status before UPLOADED)
  const isPendingDeletion = (taskId: string): boolean => {
    const task = tasks.find((t: Task) => t.id === taskId);
    if (!task?.latestEvent) {
      return false;
    }

    return (
      task.latestEvent.eventType === EventType.DELETE &&
      (task.latestEvent.status === EventStatus.LOCAL ||
        task.latestEvent.status === EventStatus.APPROVED ||
        task.latestEvent.status === EventStatus.PENDING_UPLOAD)
    );
  };

  // Helper to check if task has UPLOADED status (for checkmark indicator)
  const isUploaded = (taskId: string): boolean => {
    const task = tasks.find((t: Task) => t.id === taskId);
    return task?.latestEvent?.status === EventStatus.UPLOADED;
  };

  // Helper to check if task has CONFLICT status
  const isConflict = (taskId: string): boolean => {
    const task = tasks.find((t: Task) => t.id === taskId);
    return task?.latestEvent?.status === EventStatus.CONFLICT;
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
        const taskId = params.row.id as string;

        // Check for conflict status (yellow warning)
        if (isConflict(taskId)) {
          return (
            <Tooltip title="Conflict: event arrived too late" placement="right">
              <WarningIcon sx={{ color: "warning.main", fontSize: "1rem" }} />
            </Tooltip>
          );
        }

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
            <Tooltip title="Pending XML upload to R-segment" placement="right">
              <FiberManualRecordIcon sx={{ color: "primary.main", fontSize: "0.8rem" }} />
            </Tooltip>
          );
        }

        if (changeStatus === ChangeStatus.UPLOADED || isUploaded(taskId)) {
          // No indicator for uploaded tasks (they're stable)
          return null;
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
        const taskId = params.row.id as string;
        const pendingDeletion = isPendingDeletion(taskId);
        return (
          <span style={strikethroughDimmedStyle(pendingDeletion)}>{params.value as string}</span>
        );
      },
    },
    {
      field: "taskType",
      headerName: "Task Type",
      flex: 1,
      minWidth: 120,
      renderCell: (params): JSX.Element => {
        const taskId = params.row.id as string;
        const pendingDeletion = isPendingDeletion(taskId);
        return (
          <span style={strikethroughDimmedStyle(pendingDeletion)}>{params.value as string}</span>
        );
      },
    },
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1.2,
      minWidth: 140,
      renderCell: (params): JSX.Element => {
        const taskId = params.row.id as string;
        const pendingDeletion = isPendingDeletion(taskId);
        return (
          <span style={strikethroughDimmedStyle(pendingDeletion)}>{params.value as string}</span>
        );
      },
    },
    {
      field: "depth",
      headerName: "Depth",
      flex: 1.5,
      minWidth: 150,
      renderCell: (params): JSX.Element => {
        const taskId = params.row.id as string;
        const pendingDeletion = isPendingDeletion(taskId);
        return (
          <span style={strikethroughDimmedStyle(pendingDeletion)}>{params.value as string}</span>
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
        const taskId = params.row.id as string;
        const pendingDeletion = isPendingDeletion(taskId);

        return (
          <Chip
            label={priority}
            size="small"
            sx={{
              bgcolor: colors.bg,
              color: colors.text,
              opacity: pendingDeletion ? 0.6 : 1,
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
        const taskId = params.row.id as string;
        const pendingDeletion = isPendingDeletion(taskId);
        return <span style={{ opacity: pendingDeletion ? 0.6 : 1 }}>{params.value as string}</span>;
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params): JSX.Element => {
        const taskId = params.row.id as string;
        const pendingDeletion = isPendingDeletion(taskId);
        const displayValue = params.value as string;
        return <span style={{ opacity: pendingDeletion ? 0.6 : 1 }}>{displayValue}</span>;
      },
    },
    {
      field: "lastCollected",
      headerName: "Last Collected",
      flex: 1.5,
      minWidth: 180,
      renderCell: (params): JSX.Element => {
        const taskId = params.row.id as string;
        const pendingDeletion = isPendingDeletion(taskId);
        return <span style={{ opacity: pendingDeletion ? 0.6 : 1 }}>{params.value as string}</span>;
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
        {/* Left side - Add Tasks and Delete Selected buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
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

          {/* Delete Selected button - only enabled for eligible tasks */}
          <Tooltip title={deleteEligibility.reason} arrow placement="top">
            <span>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={!deleteEligibility.eligible}
                onClick={handleDeleteSelected}
                sx={{ textTransform: "none" }}
              >
                DELETE SELECTED ({rowSelectionModel.ids.size})
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Right side - History and Review Updates buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* TODO: History button (placeholder for future) */}
          {/* <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            sx={{ textTransform: "none" }}
            disabled
          >
            HISTORY
          </Button> */}

          {/* Review Updates button */}
          <Button
            variant="contained"
            disabled={!hasPendingUpdates}
            onClick={(): void => {
              navigate("/review-changes");
            }}
            sx={{ textTransform: "none" }}
          >
            REVIEW UPDATES ({pendingUpdatesCount})
          </Button>
        </Box>
      </Box>

      {/* Data Grid - with checkbox selection enabled */}
      <NdsDataGrid
        checkboxSelection
        rows={rows}
        columns={columns}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
          setRowSelectionModel(newSelection);
        }}
        menuItems={[
          {
            label: "View Details",
            icon: <InfoIcon color="action" />,
            onClick: (params: TaskDisplay): void => {
              handleViewDetails(params);
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

      {/* Delete Selected Confirmation Dialog */}
      <DeleteSelectedConfirmDialog
        open={deleteSelectedDialogOpen}
        onClose={() => setDeleteSelectedDialogOpen(false)}
        onConfirm={handleConfirmDeleteSelected}
        selectedCount={rowSelectionModel.ids.size}
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        open={taskDetailsDialogOpen}
        onClose={() => {
          setTaskDetailsDialogOpen(false);
          setSelectedTaskForDetails(null);
        }}
        task={selectedTaskForDetails}
      />
    </Box>
  );
}

export default RequestListingPage;

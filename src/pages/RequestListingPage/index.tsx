import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Button, Chip, Tooltip, Typography, CircularProgress } from "@mui/material";
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
  useDeleteTaskMutation,
  useTasksQuery,
  useExportSelectedTasksMutation,
  useDeleteSelectedTasksMutation,
} from "../../queries/tasks";
import { priorityColors, strikethroughDimmedStyle } from "../../utils/textStyling";
import { generateXml, encryptXml, downloadXmlFile } from "../../utils/xmlGenerator";
import AddTasksStagingDialog from "./components/AddTasksStagingDialog";
import DeleteTaskDialog from "./components/DeleteTaskDialog";
import DeleteSelectedConfirmDialog from "./components/DeleteSelectedConfirmDialog";
import ExportPasswordDialog from "../ReviewChangesPage/components/ExportPasswordDialog";
import TaskDetailsDialog from "./components/TaskDetailsDialog";
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
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [exportPasswordDialogOpen, setExportPasswordDialogOpen] = useState(false);
  const [deleteSelectedDialogOpen, setDeleteSelectedDialogOpen] = useState(false);
  const [taskDetailsDialogOpen, setTaskDetailsDialogOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);

  // Use React Query to fetch tasks
  const { data: tasks = [] } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const exportSelectedMutation = useExportSelectedTasksMutation();
  const deleteSelectedMutation = useDeleteSelectedTasksMutation();

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

  // Handle delete task (legacy - can be removed if not used elsewhere)
  const handleDeleteTask = (taskDisplay: TaskDisplay): void => {
    setTaskToDelete(taskDisplay);
    setDeleteDialogOpen(true);
  };

  // Confirm delete (legacy - can be removed if not used elsewhere)
  const handleConfirmDelete = (): void => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete.id);
    }
    setTaskToDelete(null);
  };

  // Handle delete selected tasks
  const handleDeleteSelected = (): void => {
    if (rowSelectionModel.ids.size === 0) {
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

  // Handle export selected tasks
  const handleExportSelected = (): void => {
    if (rowSelectionModel.ids.size === 0) {
      return;
    }
    setExportPasswordDialogOpen(true);
  };

  // Handle password confirm for export
  const handleExportPasswordConfirm = async (password: string): Promise<void> => {
    try {
      // Convert selection model to string array (row IDs are strings in our case)
      const selectedIds = Array.from(rowSelectionModel.ids).map((id) => String(id));

      // Call API to get task data for selected IDs
      const response = await exportSelectedMutation.mutateAsync(selectedIds);

      // Parse response (simple runtime validation)
      if (!response || !Array.isArray(response.tasks)) {
        throw new Error("Invalid response format from export API");
      }

      const selectedTasks: Task[] = response.tasks;

      // Generate XML from tasks
      const xmlContent = generateXml(selectedTasks);

      // Encrypt with password
      const encryptedXml = encryptXml(xmlContent, password);

      // Download the file
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      downloadXmlFile(encryptedXml, `tms_selected_export_${timestamp}.xml`);

      // Clear selection after successful export
      setRowSelectionModel({ type: "include", ids: new Set() });
    } catch (error) {
      console.error("Failed to export selected tasks:", error);
      // Error handling could be improved with user notification
    }
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
          <span style={strikethroughDimmedStyle(isPendingDeletion)}>{params.value as string}</span>
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
          <span style={strikethroughDimmedStyle(isPendingDeletion)}>{params.value as string}</span>
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
          <span style={strikethroughDimmedStyle(isPendingDeletion)}>{params.value as string}</span>
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
          <span style={strikethroughDimmedStyle(isPendingDeletion)}>{params.value as string}</span>
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
              opacity: isPendingDeletion ? 0.6 : 1,
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
          <span style={{ opacity: isPendingDeletion ? 0.6 : 1 }}>{params.value as string}</span>
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
        const displayValue = params.value as string;
        return <span style={{ opacity: isPendingDeletion ? 0.6 : 1 }}>{displayValue}</span>;
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
          <span style={{ opacity: isPendingDeletion ? 0.6 : 1 }}>{params.value as string}</span>
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

        {/* Right side - Delete Selected, Download Selected XML, Review Changes buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Delete Selected button */}
          <Tooltip
            title={rowSelectionModel.ids.size === 0 ? "Select one or more tasks to delete" : ""}
            arrow
            placement="top"
          >
            <span>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={rowSelectionModel.ids.size === 0}
                onClick={handleDeleteSelected}
                sx={{ textTransform: "none" }}
              >
                DELETE SELECTED ({rowSelectionModel.ids.size})
              </Button>
            </span>
          </Tooltip>

          {/* Download Selected XML button */}
          <Tooltip
            title={rowSelectionModel.ids.size === 0 ? "Select at least one task to download" : ""}
            arrow
            placement="top"
          >
            <span>
              <Button
                variant="outlined"
                startIcon={
                  exportSelectedMutation.isPending ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DownloadIcon />
                  )
                }
                disabled={rowSelectionModel.ids.size === 0 || exportSelectedMutation.isPending}
                onClick={handleExportSelected}
                sx={{ textTransform: "none" }}
              >
                DOWNLOAD SELECTED XML ({rowSelectionModel.ids.size})
              </Button>
            </span>
          </Tooltip>

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

      {/* Export Password Dialog */}
      <ExportPasswordDialog
        open={exportPasswordDialogOpen}
        onClose={() => setExportPasswordDialogOpen(false)}
        onConfirm={handleExportPasswordConfirm}
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

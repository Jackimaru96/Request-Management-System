import { JSX, useState, useMemo } from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { NdsDataGrid, GridColDef, type NdsBaseSelectOption } from "@nautilus/nds-react";
import { Task, TaskDisplay, ChangeStatus } from "./types";
import { tasksToDisplay } from "./helpers";
import AddTasksStagingDialog from "./components/AddTasksStagingDialog";
import { useTasksQuery, useCreateTaskMutation } from "../../queries/tasks";
import { priorityColors } from "../../utils/colours";

function RequestListingPage(): JSX.Element {
  const [quickFilterSearch, setQuickFilterSearch] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState<NdsBaseSelectOption[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<NdsBaseSelectOption[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [addTasksDialogOpen, setAddTasksDialogOpen] = useState(false);

  // Use React Query to fetch tasks
  const { data: tasks = [] } = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();

  // Convert tasks to display format
  const rows: TaskDisplay[] = useMemo(() => tasksToDisplay(tasks), [tasks]);

  // Calculate if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return tasks.some(
      (task: Task) =>
        task.changeStatus === ChangeStatus.ADDED || task.changeStatus === ChangeStatus.DELETED,
    );
  }, [tasks]);

  // Count pending changes
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
        const colors = priorityColors[priority] || { bg: "#757575", text: "#fff" };

        return (
          <Chip
            label={priority}
            size="small"
            sx={{ bgcolor: colors.bg, color: colors.text, fontWeight: "bold" }}
          />
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

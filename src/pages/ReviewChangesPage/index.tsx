import { JSX, useState, useMemo } from "react";
import { Box, Button, Typography, Chip, Tab, Tabs, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { NdsDataGrid, GridColDef, GridRowSelectionModel } from "@nautilus/nds-react";
import { useNavigate } from "react-router";
import {
  Task,
  TaskDisplay,
  ChangeStatus,
  EventStatus,
  EventType,
} from "../RequestListingPage/types";
import { tasksToDisplay } from "../RequestListingPage/helpers";
import {
  useTasksQuery,
  useExportTasksMutation,
  useRevertSelectedTasksMutation,
  useDeleteSelectedTasksMutation,
} from "../../queries/tasks";
import { generateXml, encryptXml, downloadXmlFile } from "../../utils/xmlGenerator";
import ExportPasswordDialog from "./components/ExportPasswordDialog";
import { priorityColors, strikethroughDimmedStyle } from "../../utils/textStyling";

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`review-tabpanel-${index}`}
      aria-labelledby={`review-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number): { id: string; "aria-controls": string } {
  return {
    id: `review-tab-${index}`,
    "aria-controls": `review-tabpanel-${index}`,
  };
}

function ReviewChangesPage(): JSX.Element {
  const navigate = useNavigate();
  const { data: allTasks = [] } = useTasksQuery();
  const exportMutation = useExportTasksMutation();
  const revertMutation = useRevertSelectedTasksMutation();
  const deleteMutation = useDeleteSelectedTasksMutation();

  const [tabValue, setTabValue] = useState(0);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [changesSelection, setChangesSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [exportsSelection, setExportsSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  // ====== CHANGES TAB ======
  // Tasks with LOCAL or APPROVED status (ready to export)
  // Per sync doc: these are pending changes not yet exported to XML
  const changesTasks = useMemo(() => {
    return allTasks.filter((task: Task) => {
      const status = task.latestEvent?.status;
      return status === EventStatus.LOCAL || status === EventStatus.APPROVED;
    });
  }, [allTasks]);

  // ====== CONFLICTS TAB ======
  // Tasks with CONFLICT status
  const conflictsTasks = useMemo(() => {
    return allTasks.filter((task: Task) => task.latestEvent?.status === EventStatus.CONFLICT);
  }, [allTasks]);

  // ====== EXPORTS TAB ======
  // Tasks with PENDING_UPLOAD status (awaiting upload to R-segment)
  const exportsTasks = useMemo(() => {
    return allTasks.filter((task: Task) => task.latestEvent?.status === EventStatus.PENDING_UPLOAD);
  }, [allTasks]);

  // Convert to display format
  const changesRows: TaskDisplay[] = useMemo(() => tasksToDisplay(changesTasks), [changesTasks]);
  const conflictsRows: TaskDisplay[] = useMemo(
    () => tasksToDisplay(conflictsTasks),
    [conflictsTasks],
  );
  const exportsRows: TaskDisplay[] = useMemo(() => tasksToDisplay(exportsTasks), [exportsTasks]);

  // Get selected tasks for Changes tab
  const selectedChangesTasks = useMemo(() => {
    const selectedIds = Array.from(changesSelection.ids).map((id) => String(id));
    return changesTasks.filter((task) => selectedIds.includes(task.id));
  }, [changesSelection, changesTasks]);

  // Get selected tasks for Exports tab
  const selectedExportsTasks = useMemo(() => {
    const selectedIds = Array.from(exportsSelection.ids).map((id) => String(id));
    return exportsTasks.filter((task) => selectedIds.includes(task.id));
  }, [exportsSelection, exportsTasks]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  // ====== CHANGES TAB ACTIONS ======

  // Export selected (commits changes: APPROVED → PENDING_UPLOAD)
  const handleExportSelected = (): void => {
    if (selectedChangesTasks.length === 0) {
      return;
    }
    setPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = (password: string): void => {
    // Generate XML for selected tasks
    const xmlContent = generateXml(selectedChangesTasks);

    // Encrypt the XML
    const encryptedXml = encryptXml(xmlContent, password);

    // Download the file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    downloadXmlFile(encryptedXml, `tms_export_${timestamp}.xml`);

    // Mark selected tasks as PENDING_UPLOAD
    const taskIds = selectedChangesTasks.map((task) => task.id);
    exportMutation.mutate(taskIds, {
      onSuccess: () => {
        // Clear selection after successful export
        setChangesSelection({ type: "include", ids: new Set() });
      },
    });
  };

  // Revert selected (discard local/approved changes)
  const handleRevertSelected = (): void => {
    if (selectedChangesTasks.length === 0) {
      return;
    }

    const taskIds = selectedChangesTasks.map((task) => task.id);
    revertMutation.mutate(taskIds, {
      onSuccess: () => {
        // Clear selection after successful revert
        setChangesSelection({ type: "include", ids: new Set() });
      },
    });
  };

  // ====== EXPORTS TAB ACTIONS ======

  // Delete selected from Exports tab
  const handleDeleteExports = (): void => {
    if (selectedExportsTasks.length === 0) {
      return;
    }

    const taskIds = selectedExportsTasks.map((task) => task.id);
    deleteMutation.mutate(taskIds, {
      onSuccess: () => {
        // Clear selection after successful delete
        setExportsSelection({ type: "include", ids: new Set() });
      },
    });
  };

  // Redownload XML for exports (read-only, no status change)
  const handleRedownloadXml = (): void => {
    if (exportsTasks.length === 0) {
      return;
    }
    // Open password dialog for redownload
    setPasswordDialogOpen(true);
  };

  const handleRedownloadPasswordConfirm = (password: string): void => {
    // Generate XML for all exports tasks
    const xmlContent = generateXml(exportsTasks);

    // Encrypt the XML
    const encryptedXml = encryptXml(xmlContent, password);

    // Download the file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    downloadXmlFile(encryptedXml, `tms_redownload_${timestamp}.xml`);
  };

  // Helper to check if task is pending deletion
  const isPendingDeletion = (taskId: string, taskList: Task[]): boolean => {
    const task = taskList.find((t: Task) => t.id === taskId);
    return task?.latestEvent?.eventType === EventType.DELETE;
  };

  // ====== COLUMN DEFINITIONS ======

  // Changes tab columns (with change type indicator)
  const changesColumns: GridColDef[] = [
    {
      field: "changeStatus",
      headerName: "",
      width: 80,
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params): JSX.Element | null => {
        const changeStatus = params.value as ChangeStatus | null;

        if (changeStatus === ChangeStatus.ADDED) {
          return (
            <Chip
              label="ADD"
              size="small"
              sx={{
                bgcolor: "success.main",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.7rem",
              }}
            />
          );
        }

        if (changeStatus === ChangeStatus.DELETED) {
          return (
            <Chip
              label="DELETE"
              size="small"
              sx={{ bgcolor: "error.main", color: "white", fontWeight: "bold", fontSize: "0.7rem" }}
            />
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
        const isDeleting = isPendingDeletion(params.row.id as string, changesTasks);
        return <span style={strikethroughDimmedStyle(isDeleting)}>{params.value as string}</span>;
      },
    },
    {
      field: "taskType",
      headerName: "Task Type",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "depth",
      headerName: "Depth",
      flex: 1.2,
      minWidth: 120,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.8,
      minWidth: 90,
      renderCell: (params): JSX.Element => {
        const priority = params.value as string;
        const colors = priorityColors[priority] || { bg: "#757575", text: "#fff" };

        return (
          <Chip label={priority} size="small" sx={{ bgcolor: colors.bg, color: colors.text }} />
        );
      },
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "zone",
      headerName: "Zone",
      flex: 0.5,
      minWidth: 60,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 100,
    },
    {
      field: "lastCollected",
      headerName: "Last Collected",
      flex: 1.2,
      minWidth: 140,
    },
  ];

  // Exports tab columns (similar but without change indicator, add view action)
  const exportsColumns: GridColDef[] = [
    {
      field: "changeStatus",
      headerName: "",
      width: 50,
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (): JSX.Element => {
        return (
          <Tooltip title="Pending upload to R-segment" placement="right">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.main",
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: "url",
      headerName: "URL",
      flex: 2.5,
      minWidth: 250,
      renderCell: (params): JSX.Element => {
        const isDeleting = isPendingDeletion(params.row.id as string, exportsTasks);
        return <span style={strikethroughDimmedStyle(isDeleting)}>{params.value as string}</span>;
      },
    },
    {
      field: "taskType",
      headerName: "Task Type",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "depth",
      headerName: "Depth",
      flex: 1.2,
      minWidth: 120,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.8,
      minWidth: 90,
      renderCell: (params): JSX.Element => {
        const priority = params.value as string;
        const colors = priorityColors[priority] || { bg: "#757575", text: "#fff" };

        return (
          <Chip label={priority} size="small" sx={{ bgcolor: colors.bg, color: colors.text }} />
        );
      },
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "zone",
      headerName: "Zone",
      flex: 0.5,
      minWidth: 60,
    },
  ];

  // Conflicts tab columns
  const conflictsColumns: GridColDef[] = [
    {
      field: "changeStatus",
      headerName: "",
      width: 80,
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (): JSX.Element => {
        return (
          <Chip
            label="CONFLICT"
            size="small"
            sx={{
              bgcolor: "warning.main",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.65rem",
            }}
          />
        );
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
      minWidth: 100,
    },
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "depth",
      headerName: "Depth",
      flex: 1.2,
      minWidth: 120,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.8,
      minWidth: 90,
      renderCell: (params): JSX.Element => {
        const priority = params.value as string;
        const colors = priorityColors[priority] || { bg: "#757575", text: "#fff" };

        return (
          <Chip label={priority} size="small" sx={{ bgcolor: colors.bg, color: colors.text }} />
        );
      },
    },
    {
      field: "country",
      headerName: "Country",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "zone",
      headerName: "Zone",
      flex: 0.5,
      minWidth: 60,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 100,
    },
    {
      field: "lastCollected",
      headerName: "Last Collected",
      flex: 1.2,
      minWidth: 140,
    },
  ];

  return (
    <Box sx={{ padding: "32px 64px 16px 64px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/request-listing-page")}
          sx={{ minWidth: "auto", p: 1 }}
        />
      </Box>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Review Updates
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="review updates tabs">
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                CHANGES
                <Chip
                  label={changesTasks.length}
                  size="small"
                  sx={{ height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
            {...a11yProps(0)}
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                CONFLICTS
                <Chip
                  label={conflictsTasks.length}
                  size="small"
                  sx={{ height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
            {...a11yProps(1)}
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                EXPORTS
                <Chip
                  label={exportsTasks.length}
                  size="small"
                  sx={{ height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>

      {/* CHANGES TAB */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tasks that have been added, edited, or deleted and are ready to be exported.
        </Typography>

        {/* Changes toolbar */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            disabled={changesSelection.ids.size === 0 || exportMutation.isPending}
            onClick={handleExportSelected}
          >
            EXPORT SELECTED ({changesSelection.ids.size})
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<UndoIcon />}
            disabled={changesSelection.ids.size === 0 || revertMutation.isPending}
            onClick={handleRevertSelected}
          >
            REVERT SELECTED ({changesSelection.ids.size})
          </Button>
        </Box>

        <NdsDataGrid
          checkboxSelection
          rows={changesRows}
          columns={changesColumns}
          rowSelectionModel={changesSelection}
          onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
            setChangesSelection(newSelection);
          }}
          rowCount={changesRows.length}
          pageSizeOptions={[10, 25, 50]}
          paginationMode="client"
          menuItems={[
            {
              label: "View Details",
              icon: <VisibilityIcon color="action" />,
              onClick: (): void => {
                // TODO: Implement view details
              },
            },
          ]}
          rowMenu
        />

        {/* Export All button at bottom */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            disabled={changesTasks.length === 0}
            onClick={() => {
              // Select all and export
              const allIds = new Set(changesTasks.map((t) => t.id));
              setChangesSelection({ type: "include", ids: allIds });
              setPasswordDialogOpen(true);
            }}
          >
            EXPORT ALL AS XML
          </Button>
        </Box>
      </TabPanel>

      {/* CONFLICTS TAB */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tasks where changes could not be applied because they are already in collection or
          completed.
        </Typography>

        <NdsDataGrid
          disableRowSelectionOnClick
          rows={conflictsRows}
          columns={conflictsColumns}
          rowCount={conflictsRows.length}
          pageSizeOptions={[10, 25, 50]}
          paginationMode="client"
        />
      </TabPanel>

      {/* EXPORTS TAB */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tasks that have been exported and are awaiting upload to the other system.
        </Typography>

        {/* Exports toolbar */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Tooltip
            title={
              exportsSelection.ids.size === 0
                ? "Select tasks to delete"
                : "Create DELETE events for selected tasks"
            }
          >
            <span>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                disabled={exportsSelection.ids.size === 0 || deleteMutation.isPending}
                onClick={handleDeleteExports}
              >
                DELETE SELECTED ({exportsSelection.ids.size})
              </Button>
            </span>
          </Tooltip>
        </Box>

        <NdsDataGrid
          checkboxSelection
          rows={exportsRows}
          columns={exportsColumns}
          rowSelectionModel={exportsSelection}
          onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => {
            setExportsSelection(newSelection);
          }}
          rowCount={exportsRows.length}
          pageSizeOptions={[10, 25, 50]}
          paginationMode="client"
          menuItems={[
            {
              label: "View Details",
              icon: <VisibilityIcon color="action" />,
              onClick: (): void => {
                // TODO: Implement view details
              },
            },
          ]}
          rowMenu
        />

        {/* Redownload XML button at bottom */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            disabled={exportsTasks.length === 0}
            onClick={handleRedownloadXml}
          >
            REDOWNLOAD XML
          </Button>
        </Box>
      </TabPanel>

      {/* Password Dialog - handles both export and redownload */}
      <ExportPasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onConfirm={(password) => {
          if (tabValue === 2) {
            // Exports tab - redownload
            handleRedownloadPasswordConfirm(password);
          } else {
            // Changes tab - export selected
            handlePasswordConfirm(password);
          }
        }}
      />
    </Box>
  );
}

export default ReviewChangesPage;

import { JSX, useState, useMemo } from "react";
import { Box, Button, Typography, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { NdsDataGrid, GridColDef } from "@nautilus/nds-react";
import { useNavigate } from "react-router";
import { Task, TaskDisplay, ChangeStatus } from "../RequestListingPage/types";
import { tasksToDisplay } from "../RequestListingPage/helpers";
import { useTasksQuery, useExportTasksMutation } from "../../queries/tasks";
import { generateXml, encryptXml, downloadXmlFile } from "../../utils/xmlGenerator";
import ExportPasswordDialog from "./components/ExportPasswordDialog";
import { priorityColors } from "../../utils/colours";

function ReviewChangesPage(): JSX.Element {
  const navigate = useNavigate();
  const { data: allTasks = [] } = useTasksQuery();
  const exportMutation = useExportTasksMutation();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Filter tasks with LOCAL changes (ADDED or DELETED)
  // These are the "pending changes" that haven't been exported yet
  const pendingTasks = useMemo(() => {
    return allTasks.filter(
      (task: Task) =>
        task.changeStatus === ChangeStatus.ADDED || task.changeStatus === ChangeStatus.DELETED,
    );
  }, [allTasks]);

  // Convert to display format
  const rows: TaskDisplay[] = useMemo(() => tasksToDisplay(pendingTasks), [pendingTasks]);

  const handleExport = (): void => {
    if (pendingTasks.length === 0) {
      return;
    }
    setPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = (password: string): void => {
    // Generate XML for pending tasks
    const xmlContent = generateXml(pendingTasks);

    // Encrypt the XML
    const encryptedXml = encryptXml(xmlContent, password);

    // Download the file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    downloadXmlFile(encryptedXml, `tms_export_${timestamp}.xml`);

    // Mark all exported tasks as PENDING_UPLOAD
    const taskIds = pendingTasks.map((task) => task.id);
    exportMutation.mutate(taskIds, {
      onSuccess: () => {
        // Navigate back to main page after successful export
        navigate("/request-listing-page");
      },
    });
  };

  const columns: GridColDef[] = [
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
              sx={{ bgcolor: "success.main", color: "white", fontWeight: "bold" }}
            />
          );
        }

        if (changeStatus === ChangeStatus.DELETED) {
          return (
            <Chip
              label="DELETE"
              size="small"
              sx={{ bgcolor: "error.main", color: "white", fontWeight: "bold" }}
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/request-listing-page")}>
          Back
        </Button>
        <Typography variant="h4">Review Changes</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Review the pending changes below before exporting to XML.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {pendingTasks.length} {pendingTasks.length === 1 ? "change" : "changes"} pending export
        </Typography>
      </Box>

      <NdsDataGrid
        disableRowSelectionOnClick
        rows={rows}
        columns={columns}
        tableTitle="Pending Changes"
        rowCount={rows.length}
        pageSizeOptions={[10, 25, 50]}
        paginationMode="client"
      />

      <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3, gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExport}
          disabled={pendingTasks.length === 0}
        >
          Export as XML
        </Button>
      </Box>

      <ExportPasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onConfirm={handlePasswordConfirm}
      />
    </Box>
  );
}

export default ReviewChangesPage;

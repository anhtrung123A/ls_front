import { useEffect, useState } from "react";
import AddCircleButton from "../components/common/AddCircleButton";
import ComponentCard from "../components/common/ComponentCard";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Badge from "../components/ui/badge/Badge";
import { Modal } from "../components/ui/modal";
import Blank from "./Blank";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useAppAlert } from "../context/AppAlertContext";
import { useAuth } from "../context/AuthContext";
import { getLeadSourceLabel, getLeadStatusLabel } from "../constants/leads";
import {
  createLead,
  getLeads,
  type CreateLeadPayload,
  type Lead,
} from "../services/leadService";

type LeadForm = {
  firstName: string;
  fullName: string;
  source: string;
  status: string;
  note: string;
  metadata: string;
};

const initialForm: LeadForm = {
  firstName: "",
  fullName: "",
  source: "1",
  status: "1",
  note: "",
  metadata: "",
};

function getLeadStatusColor(status: number) {
  if (status === 1) {
    return "info";
  }
  if (status === 2) {
    return "warning";
  }
  if (status === 3) {
    return "primary";
  }
  if (status === 4) {
    return "success";
  }
  return "error";
}

export default function Leads() {
  const [items, setItems] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<LeadForm>(initialForm);
  const { showAlert } = useAppAlert();
  const { user } = useAuth();

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await getLeads(1, 50);
      setItems(response.items);
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Failed to fetch leads",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeads();
  }, [showAlert]);

  const handleCreate = async () => {
    if (!form.firstName.trim() || !form.fullName.trim()) {
      showAlert({
        variant: "warning",
        title: "Missing required fields",
        message: "First name and full name are required.",
      });
      return;
    }

    if (!user?.id) {
      showAlert({
        variant: "error",
        title: "User profile missing",
        message: "Cannot detect current user to assign lead.",
      });
      return;
    }

    const payload: CreateLeadPayload = {
      firstName: form.firstName.trim(),
      fullName: form.fullName.trim(),
      source: Number(form.source),
      status: Number(form.status),
      assignedTo: user.id,
      note: form.note.trim() || undefined,
      metadata: form.metadata.trim() || undefined,
    };

    setIsSaving(true);
    try {
      await createLead(payload);
      showAlert({
        variant: "success",
        title: "Lead created",
        message: "Lead created successfully.",
      });
      setIsOpen(false);
      setForm(initialForm);
      await fetchLeads();
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Create lead failed",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="Leads | Admin" description="Manage leads" />
      <PageBreadcrumb pageTitle="Leads" />
      <ComponentCard title="Leads">
        <div className="mb-3 flex justify-end">
          <AddCircleButton onClick={() => setIsOpen(true)} ariaLabel="Create lead" />
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading leads...</p>
        ) : items.length === 0 ? (
          <Blank
            embedded
            title="No leads found"
            description="There are no leads yet. Create your first lead to start sales tracking."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Source
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Note
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {items.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div>
                          <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                            {lead.fullName}
                          </p>
                          <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                            {lead.firstName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {getLeadSourceLabel(lead.source)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        <Badge size="sm" color={getLeadStatusColor(lead.status)}>
                          {getLeadStatusLabel(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {lead.note || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-[700px] m-4">
        <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Create Lead
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">First name</span>
              <input
                value={form.firstName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Full name</span>
              <input
                value={form.fullName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Source</span>
              <select
                value={form.source}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, source: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              >
                <option value="1" className="text-black">
                  Facebook
                </option>
                <option value="2" className="text-black">
                  Zalo
                </option>
                <option value="3" className="text-black">
                  Referral
                </option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              >
                <option value="1" className="text-black">
                  New
                </option>
                <option value="2" className="text-black">
                  Consulting
                </option>
                <option value="3" className="text-black">
                  Tested
                </option>
                <option value="4" className="text-black">
                  Converted
                </option>
                <option value="5" className="text-black">
                  Failed
                </option>
              </select>
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Note</span>
              <textarea
                rows={3}
                value={form.note}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, note: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Metadata (JSON string)</span>
              <textarea
                rows={3}
                value={form.metadata}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, metadata: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isSaving} onClick={() => void handleCreate()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

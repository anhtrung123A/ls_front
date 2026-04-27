import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import AddCircleButton from "../components/common/AddCircleButton";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import UserAvatar from "../components/common/UserAvatar";
import Badge from "../components/ui/badge/Badge";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useAppAlert } from "../context/AppAlertContext";
import { ROLE_ID_NAME_MAP } from "../constants/roles";
import {
  createBranchUser,
  deleteBranchUser,
  getBranchUsers,
  updateBranchUserStatus,
  type BranchUser,
} from "../services/branchUserService";
import Blank from "./Blank";

type BranchUserForm = {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  dateOfBirth: string;
  roleId: string;
};

const initialForm: BranchUserForm = {
  firstname: "",
  lastname: "",
  email: "",
  phonenumber: "",
  dateOfBirth: "",
  roleId: "4",
};

export default function BranchUsers() {
  const { branchId } = useParams();
  const parsedBranchId = Number(branchId);
  const { showAlert } = useAppAlert();

  const [items, setItems] = useState<BranchUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<BranchUserForm>(initialForm);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const roleOptions = useMemo(
    () => Object.entries(ROLE_ID_NAME_MAP).map(([id, name]) => ({ id, name })),
    [],
  );

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const response = await getBranchUsers(parsedBranchId || undefined, 1, 50);
      setItems(response.items);
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Failed to fetch branch users",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchList();
  }, [branchId]);

  const handleCreate = async () => {
    if (!parsedBranchId) {
      return;
    }

    setIsSaving(true);
    try {
      await createBranchUser({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        phonenumber: form.phonenumber.trim(),
        dateOfBirth: form.dateOfBirth,
        branchId: parsedBranchId,
        roleId: Number(form.roleId),
      });

      showAlert({
        variant: "success",
        title: "Branch user created",
        message: "Branch user created successfully.",
      });

      setIsOpen(false);
      setForm(initialForm);
      await fetchList();
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Create failed",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) {
      return;
    }
    try {
      await deleteBranchUser(deleteTargetId);
      showAlert({
        variant: "success",
        title: "Branch user deleted",
        message: "Branch user deleted successfully.",
      });
      setDeleteTargetId(null);
      await fetchList();
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Delete failed",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    }
  };

  const toggleStatus = async (user: BranchUser) => {
    const nextStatus = user.status === 1 ? 2 : 1;
    try {
      await updateBranchUserStatus(user.id, nextStatus);
      showAlert({
        variant: "success",
        title: "Branch user updated",
        message: "Branch user status updated successfully.",
      });
      await fetchList();
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Update failed",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    }
  };

  return (
    <>
      <PageMeta title="Branch Users | Admin" description="Manage branch users" />
      <PageBreadcrumb pageTitle={`Branch Users (${parsedBranchId || "-"})`} />
      <ComponentCard title={`Branch Users (Branch #${parsedBranchId || "-"})`}>
        <div className="mb-2 flex items-center justify-between">
          <Link to="/branches" className="text-sm text-brand-500 hover:underline">
            ← Back to branches
          </Link>
          <AddCircleButton onClick={() => setIsOpen(true)} ariaLabel="Create branch user" />
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading branch users...</p>
        ) : items.length === 0 ? (
          <Blank
            embedded
            title="No users found"
            description="This branch does not have any users yet. Click the add button to create the first branch user."
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
                      User
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Phone
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          <UserAvatar
                            avatarUrl={user.avatarUrl}
                            name={`${user.firstname} ${user.lastname}`}
                            email={user.email}
                            textClassName="text-sm"
                          />
                        </div>
                        <div>
                          <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                            {`${user.firstname} ${user.lastname}`}
                          </span>
                          <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {user.phonenumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      <Badge size="sm" color={user.status === 1 ? "success" : "warning"}>
                        {user.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="!py-1.5"
                          onClick={() => void toggleStatus(user)}
                        >
                          {user.status === 1 ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          className="!bg-error-500 !py-1.5 hover:!bg-error-600"
                          onClick={() => setDeleteTargetId(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
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
            Create Branch User
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(
              [
                ["firstname", "First name"],
                ["lastname", "Last name"],
                ["email", "Email"],
                ["phonenumber", "Phone"],
              ] as Array<[keyof BranchUserForm, string]>
            ).map(([key, label]) => (
              <label key={key} className="text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">{label}</span>
                <input
                  value={form[key]}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [key]: event.target.value }))
                  }
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                />
              </label>
            ))}
            <label className="text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Date of birth</span>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600 dark:text-gray-300">Role</span>
              <select
                value={form.roleId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, roleId: event.target.value }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id} className="text-black">
                    {role.name}
                  </option>
                ))}
              </select>
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

      <Modal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        className="max-w-[460px] m-4"
      >
        <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            Delete Branch User
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this branch user?
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="!bg-error-500 hover:!bg-error-600"
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}


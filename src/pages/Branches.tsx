import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import {
  createBranch,
  deleteBranch,
  getBranchById,
  getBranches,
  type Branch,
  type BranchPayload,
  updateBranch,
  uploadBranchImage,
} from "../services/branchService";
import { useAppAlert } from "../context/AppAlertContext";

type BranchForm = {
  name: string;
  description: string;
  addressLine1: string;
  addressLine2: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
};

const initialForm: BranchForm = {
  name: "",
  description: "",
  addressLine1: "",
  addressLine2: "",
  ward: "",
  district: "",
  city: "",
  postalCode: "",
  country: "",
};

export default function Branches() {
  const { showAlert } = useAppAlert();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BranchForm>(initialForm);
  const [uploadingBranchId, setUploadingBranchId] = useState<number | null>(null);

  const isEditMode = useMemo(() => editingId !== null, [editingId]);

  const fetchBranchList = async () => {
    setIsLoading(true);
    try {
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Failed to fetch branches",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchBranchList();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      const branch = await getBranchById(id);
      setEditingId(id);
      setForm({
        name: branch.name,
        description: branch.description,
        addressLine1: branch.addressLine1,
        addressLine2: branch.addressLine2 || "",
        ward: branch.ward,
        district: branch.district,
        city: branch.city,
        postalCode: branch.postalCode,
        country: branch.country,
      });
      setIsOpen(true);
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Failed to fetch branch",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const toPayload = (): BranchPayload => ({
    name: form.name.trim(),
    description: form.description.trim(),
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2.trim() || null,
    ward: form.ward.trim(),
    district: form.district.trim(),
    city: form.city.trim(),
    postalCode: form.postalCode.trim(),
    country: form.country.trim(),
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isEditMode && editingId !== null) {
        await updateBranch(editingId, toPayload());
        showAlert({
          variant: "success",
          title: "Branch updated",
          message: "Branch updated successfully.",
        });
      } else {
        await createBranch(toPayload());
        showAlert({
          variant: "success",
          title: "Branch created",
          message: "Branch created successfully.",
        });
      }

      closeModal();
      await fetchBranchList();
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Save failed",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm("Delete this branch?");
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteBranch(id);
      showAlert({
        variant: "success",
        title: "Branch deleted",
        message: "Branch deleted successfully.",
      });
      await fetchBranchList();
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Delete failed",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    }
  };

  const handleUploadImage = async (branch: Branch, file: File) => {
    setUploadingBranchId(branch.id);
    try {
      await uploadBranchImage(branch.id, file, Boolean(branch.imageUrl));
      showAlert({
        variant: "success",
        title: "Branch image updated",
        message: "Branch image uploaded successfully.",
      });
      await fetchBranchList();
    } catch (error) {
      showAlert({
        variant: "error",
        title: "Image upload failed",
        message: error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setUploadingBranchId(null);
    }
  };

  return (
    <>
      <PageMeta title="Branches | Admin" description="Manage branches" />
      <PageBreadcrumb pageTitle="Branches" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Branch Management
          </h3>
          <Button
            size="sm"
            onClick={openCreate}
            className="h-12 w-12 rounded-full p-0"
            aria-label="Create branch"
          >
            <Plus size={22} />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
              <Skeleton height={160} borderRadius={12} />
              <div className="mt-4 space-y-2">
                <Skeleton height={20} width="70%" />
                <Skeleton height={14} count={2} />
                <Skeleton height={14} width="90%" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Skeleton circle width={42} height={42} />
                <Skeleton circle width={42} height={42} />
                <Skeleton circle width={42} height={42} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.02]"
              >
                <div className="h-40 w-full bg-gray-100 dark:bg-gray-800">
                  {branch.imageUrl ? (
                    <img
                      src={branch.imageUrl}
                      alt={branch.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3">
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                      {branch.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {branch.description || "-"}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-medium">Address: </span>
                      {[
                        branch.addressLine1,
                        branch.addressLine2,
                        branch.ward,
                        branch.district,
                        branch.city,
                        branch.postalCode,
                        branch.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                    <label className="inline-flex cursor-pointer">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-brand-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/[0.03]">
                        {uploadingBranchId === branch.id ? (
                          "..."
                        ) : (
                          <Upload size={20} />
                        )}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={uploadingBranchId === branch.id}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            void handleUploadImage(branch, file);
                          }
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-11 w-11 rounded-full !p-0"
                      onClick={() => void openEdit(branch.id)}
                    >
                      <Pencil size={20} />
                    </Button>
                    <Button
                      size="sm"
                      className="h-11 w-11 rounded-full !bg-error-500 !p-0 hover:!bg-error-600"
                      onClick={() => void handleDelete(branch.id)}
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[780px] m-4">
        <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            {isEditMode ? "Update Branch" : "Create Branch"}
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(
              [
                ["name", "Name"],
                ["description", "Description"],
                ["addressLine1", "Address line 1"],
                ["addressLine2", "Address line 2"],
                ["ward", "Ward"],
                ["district", "District"],
                ["city", "City"],
                ["postalCode", "Postal code"],
                ["country", "Country"],
              ] as Array<[keyof BranchForm, string]>
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
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}


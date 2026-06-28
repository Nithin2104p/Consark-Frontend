import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { approvals } from "./constants";
import { useAuth } from "../../auth/AuthContext";
import { hasPermission, PERMISSIONS } from "../../auth/permissions";
import { useTranslation } from "../../hooks/useTranslation";
import { employees } from "../../data/employees";
import { validateApprovalForm } from "./validation";
import "./ApprovalsPage.css";


const STATUS_OPTIONS = ["pending", "approved", "rejected"] as const;

const initialFormState = {
  title: "",
  type: "",
  description: "",
  approver: employees[0]?.name ?? "",
};

export function ApprovalsPage() {

  const { t } = useTranslation();
  const { role } = useAuth();
  const [approvalItems, setApprovalItems] = useState(approvals);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canEdit = hasPermission(role, PERMISSIONS.APPROVALS_EDIT);
  const currentRequester = t("user.you");

  const handleStatusChange = (id: string, status: string) => {
    setApprovalItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: status as typeof STATUS_OPTIONS[number] } : item
      )
    );
  };

  const handleInputChange = (key: keyof typeof initialFormState, value: string) => {
    setFormValues((current) => ({ ...current, [key]: value }));
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: "" }));
    }
  };

  const handleCreateRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateApprovalForm(formValues);
    if (!validation.valid) {
      setErrors(validation.errors || {});
      toast.error(t("approvals.toasts.fixFormErrors"));
      return;
    }

    const newRequest = {
      id: `request-${Date.now()}`,
      title: formValues.title,
      requester: currentRequester,
      type: formValues.type,
      approver: formValues.approver,
      status: "pending" as const,
    };

    setApprovalItems((current) => [newRequest, ...current]);
    toast.success(t("approvals.toasts.requestCreatedSuccessfully"));
    setFormValues(initialFormState);
    setErrors({});
    setIsSidebarOpen(false);
  };

  return (
    <div className="approvals-page">
      <div className="approvals-header">
        <div>
          <h1>{t("pages.approvals.title")}</h1>
          <p className="muted page-desc">{t("pages.approvals.description")}</p>
        </div>
        <button type="button" className="new-request-button" onClick={() => setIsSidebarOpen(true)}>
          + {t("approvals.newRequest")}
        </button>
      </div>

      <div className="approvals-table">
        <div className="table-header">
          <div>{t("approvals.table.approval")}</div>
          <div>{t("approvals.table.requester")}</div>
          <div>{t("approvals.table.type")}</div>
          <div>{t("approvals.table.approver")}</div>
          <div>{t("approvals.table.status")}</div>
          <div>{t("approvals.table.action")}</div>
        </div>

        {approvalItems.map((item) => (
          <div key={item.id} className="table-row">
            <div>{item.title}</div>
            <div>{item.requester}</div>
            <div>{item.type}</div>
            <div>{item.approver}</div>
            <div>
              {canEdit ? (
                <select
                  className="status-select"
                  value={item.status}
                  onChange={(event) => handleStatusChange(item.id, event.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {t(`status.${status}`)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`status-tag ${item.status}`}>{t(`status.${item.status}`)}</span>
              )}
            </div>
            <div>
              <button type="button" className="view-details-button">
                {t("actions.viewDetails")}
              </button>
            </div>

          </div>
        ))}
      </div>

      {isSidebarOpen && (
        <>
          <div className="page-backdrop" onClick={() => setIsSidebarOpen(false)} />
          <aside className="request-sidebar">
            <div className="sidebar-header">
              <h2>{t("approvals.sidebar.title")}</h2>
              <button type="button" className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
                {t("approvals.sidebar.close")}
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="request-form">
              <div className="form-field">
                <label htmlFor="request-title">{t("approvals.sidebar.requestTitle")}</label>
                <input
                  id="request-title"
                  value={formValues.title}
                  onChange={(event) => handleInputChange("title", event.target.value)}
                  placeholder={t("approvals.sidebar.enterShortTitle")}
                  className={errors.title ? "has-error" : ""}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="request-type">{t("approvals.sidebar.requestType")}</label>
                <input
                  id="request-type"
                  value={formValues.type}
                  onChange={(event) => handleInputChange("type", event.target.value)}
                  placeholder={t("approvals.sidebar.typePlaceholder")}
                  className={errors.type ? "has-error" : ""}
                />
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="request-description">{t("approvals.sidebar.description")}</label>
                <textarea
                  id="request-description"
                  value={formValues.description}
                  onChange={(event) => handleInputChange("description", event.target.value)}
                  placeholder={t("approvals.sidebar.descriptionPlaceholder")}
                  rows={5}
                  className={errors.description ? "has-error" : ""}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="request-approver">{t("approvals.sidebar.approver")}</label>
                <select
                  id="request-approver"
                  value={formValues.approver}
                  onChange={(event) => handleInputChange("approver", event.target.value)}
                  className={errors.approver ? "has-error" : ""}
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
                {errors.approver && <span className="error-message">{errors.approver}</span>}
              </div>
              <div className="sidebar-actions">
                <button type="button" className="sidebar-cancel" onClick={() => setIsSidebarOpen(false)}>
                  {t("approvals.sidebar.cancel")}
                </button>
                <button type="submit" className="sidebar-submit">
                  {t("approvals.sidebar.createRequest")}
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </div>
  );
}

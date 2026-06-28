import { useMemo, useState } from "react";
import "./ConfigPage.css";




type NotificationChannel = "EMAIL" | "SMS" | "Whatsapp" | "Slack" | "Teams";

const notificationChannels: NotificationChannel[] = [
  "EMAIL",
  "SMS",
  "Whatsapp",
  "Slack",
  "Teams",
];

type BuiltInAdminRole = "Goal admin" | "Approval admin";

const adminRoles: BuiltInAdminRole[] = ["Goal admin", "Approval admin"];

// This UI is intentionally lightweight: it stores state locally and does not
// hook into the real permission system.
export function ConfigPage() {
  const [enabledChannels, setEnabledChannels] = useState<Record<NotificationChannel, boolean>>(
    () => ({
      EMAIL: true,
      SMS: false,
      Whatsapp: false,
      Slack: false,
      Teams: false,
    })
  );

  const [customRoleName, setCustomRoleName] = useState("");
  const [customPermissionSet, setCustomPermissionSet] = useState<Record<string, boolean>>({});

  const [customRoles, setCustomRoles] = useState<
    { id: string; name: string; permissions: Record<string, boolean> }[]
  >([]);

  const visiblePermissions = useMemo(() => {
    //Note : This is Minimal permissions list for the UI.
    return [
      "Goals:create",
      "Goals:view",
      "approvals:view",
      "approvals:edit",
    ];
  }, []);

  const toggleChannel = (channel: NotificationChannel) => {
    setEnabledChannels((c) => ({ ...c, [channel]: !c[channel] }));
  };

  const togglePermission = (key: string) => {
    setCustomPermissionSet((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleCreateCustomRole = () => {
    const name = customRoleName.trim();
    if (!name) return;

    const permissions: Record<string, boolean> = {};
    for (const k of visiblePermissions) permissions[k] = Boolean(customPermissionSet[k]);

    setCustomRoles((roles) => [
      {
        id: `role-${Date.now()}`,
        name,
        permissions,
      },
      ...roles,
    ]);

    setCustomRoleName("");
    setCustomPermissionSet({});
  };

  return (
    <div className="config-page">
      <div className="config-section">
        <h2>Configuration</h2>

        <div className="config-card">
          <div className="config-card-header">Notifications</div>
          <div className="subtle">Choose how you want to receive notifications.</div>

          <div className="checkbox-grid">
            {notificationChannels.map((ch) => (
              <label key={ch} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={enabledChannels[ch]}
                  onChange={() => toggleChannel(ch)}
                />
                <span>{ch}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="config-card">
          <div className="config-card-header">Custom roles</div>
          <div className="subtle">Create a custom role and enable a few permissions.</div>

          <div className="builtins">
            {adminRoles.map((r) => (
              <div key={r} className="pill">
                {r}
              </div>
            ))}
          </div>

          <div className="form">
            <label className="label" htmlFor="custom-role-name">Role name</label>
            <input
              id="custom-role-name"
              className="input"
              value={customRoleName}
              onChange={(e) => setCustomRoleName(e.target.value)}
              placeholder="e.g. Compliance reviewer"
            />

            <div className="perm-block">
              <div className="perm-title">Enable permissions</div>
              <div className="checkbox-grid">
                {visiblePermissions.map((p) => (
                  <label key={p} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={Boolean(customPermissionSet[p])}
                      onChange={() => togglePermission(p)}
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="primary" type="button" onClick={handleCreateCustomRole}>
              Create custom role
            </button>
          </div>

          {customRoles.length > 0 && (
            <div className="custom-role-list">
              <div className="perm-title">Created roles</div>
              {customRoles.map((r) => (
                <div key={r.id} className="custom-role-item">
                  <div className="custom-role-name">{r.name}</div>
                  <div className="custom-role-perms">
                    {Object.entries(r.permissions)
                      .filter(([, v]) => v)
                      .map(([k]) => k)
                      .join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


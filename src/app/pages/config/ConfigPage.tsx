import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import {
  DEFAULT_ENABLED_CHANNELS,
  NOTIFICATION_CHANNELS,
  VISIBLE_PERMISSIONS,
  type NotificationChannel,
} from "./constants";
import "./ConfigPage.css";

export function ConfigPage() {
  const { t } = useTranslation();
  const [enabledChannels, setEnabledChannels] = useState(DEFAULT_ENABLED_CHANNELS);
  const [customRoleName, setCustomRoleName] = useState("");
  const [customPermissionSet, setCustomPermissionSet] = useState<Record<string, boolean>>({});
  const [customRoles, setCustomRoles] = useState<
    { id: string; name: string; permissions: Record<string, boolean> }[]
  >([]);

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
    for (const k of VISIBLE_PERMISSIONS) permissions[k] = Boolean(customPermissionSet[k]);

    setCustomRoles((roles) => [{ id: `role-${Date.now()}`, name, permissions }, ...roles]);
    setCustomRoleName("");
    setCustomPermissionSet({});
  };

  return (
    <div className="config-page">
      <div className="config-section">
        <h2>{t("config.title")}</h2>

        <div className="config-card">
          <div className="config-card-header">{t("config.notifications.title")}</div>
          <div className="subtle">{t("config.notifications.description")}</div>

          <div className="checkbox-grid">
            {NOTIFICATION_CHANNELS.map((ch) => (
              <label key={ch} className="checkbox-item">
                <input type="checkbox" checked={enabledChannels[ch]} onChange={() => toggleChannel(ch)} />
                <span>{ch}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="config-card">
          <div className="config-card-header">{t("config.roles.title")}</div>
          <div className="subtle">{t("config.roles.description")}</div>

          <div className="form">
            <label className="label" htmlFor="custom-role-name">
              {t("config.roles.nameLabel")}
            </label>
            <input
              id="custom-role-name"
              className="input"
              value={customRoleName}
              onChange={(e) => setCustomRoleName(e.target.value)}
              placeholder={t("config.roles.namePlaceholder")}
            />

            <div className="perm-block">
              <div className="perm-title">{t("config.roles.permissionsTitle")}</div>
              <div className="checkbox-grid">
                {VISIBLE_PERMISSIONS.map((p) => (
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
              {t("config.roles.createButton")}
            </button>
          </div>

          {customRoles.length > 0 && (
            <div className="custom-role-list">
              <div className="perm-title">{t("config.roles.createdTitle")}</div>
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

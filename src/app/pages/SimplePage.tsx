import { EmployeesList } from "./employees/EmployeesList";
import { GoalsPage } from "./Goals/GoalsPage";
import { ConfigPage } from "./config/ConfigPage";

import { useTranslation } from "../hooks/useTranslation";

type SimplePageProps = {
  titleKey: string;
  descriptionKey: string;
};

export function SimplePage({ titleKey, descriptionKey }: SimplePageProps) {
  const { t } = useTranslation();

  // If it's the employees page, show the employees list
  if (titleKey === "pages.employees.title") {
    return <EmployeesList />;
  }



  // If it's the Goals page, show Goals
  if (titleKey === "pages.Goals.title") {
    return <GoalsPage />;
  }

  // If it's the config page, show config UI
  if (titleKey === "pages.config.title") {
    return <ConfigPage />;
  }



  return (
    <div className="page">
      <h1>{t(titleKey)}</h1>
      <p className="muted page-desc">{t(descriptionKey)}</p>
    </div>
  );
}

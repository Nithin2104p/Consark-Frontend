import { Loader2 } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? t("common.loading");

  return (
    <div className="state-panel" role="status" aria-live="polite">
      <Loader2 className="spin" size={28} />
      <p className="muted">{displayMessage}</p>
    </div>
  );
}

import { AlertCircle } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="state-panel error" role="alert">
      <AlertCircle size={28} />
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          {t("common.tryAgain")}
        </button>
      )}
    </div>
  );
}

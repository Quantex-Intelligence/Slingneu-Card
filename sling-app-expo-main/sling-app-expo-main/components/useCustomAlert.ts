import { useState } from "react";
import { AlertButton } from "./CustomAlert";

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

export interface UseCustomAlertReturn {
  alertVisible: boolean;
  alertConfig: {
    title: string;
    message: string;
    type: AlertType;
    buttons: AlertButton[];
  };
  showAlert: (
    title: string, 
    message: string, 
    type?: AlertType, 
    buttons?: AlertButton[]
  ) => void;
  hideAlert: () => void;
}

export function useCustomAlert(): UseCustomAlertReturn {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as AlertType,
    buttons: [] as AlertButton[],
  });

  const showAlert = (
    title: string, 
    message: string, 
    type: AlertType = "info", 
    buttons: AlertButton[] = [{ text: "OK" }]
  ) => {
    setAlertConfig({ title, message, type, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  return {
    alertVisible,
    alertConfig,
    showAlert,
    hideAlert,
  };
} 
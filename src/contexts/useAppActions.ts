import { useContext } from "react";
import { AppActionsContext } from "./AppProviders";

export const useAppActions = () => {
  const actions = useContext(AppActionsContext);
  return actions;
}

export default useAppActions;
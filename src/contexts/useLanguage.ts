import { useContext } from "react";
import LanguageContext from "./LanguageContext";

function useLanguage() {
  const language = useContext(LanguageContext);
  return language;
}

export default useLanguage;
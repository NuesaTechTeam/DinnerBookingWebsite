import { useContext } from "react";
import GlobalContext from "./GlobalContext";

const useGlobalContext = () => useContext(GlobalContext);

export default useGlobalContext;

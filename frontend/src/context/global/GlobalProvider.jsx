import GlobalContext from "./GlobalContext";
import global_reducer from "../../reducer/global-reducer";
import { useReducer, } from "react";

const initialState = {};

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(global_reducer, initialState);


  return (
    <GlobalContext.Provider value={{ ...state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;

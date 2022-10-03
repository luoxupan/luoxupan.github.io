import * as React from "react";
import { reducer, initialState } from './reducer';

export const State = React.createContext({} as any);

export function StateProvider(props: any) {
  const { children } = props;
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <State.Provider value={{ state, dispatch }}>
      {children}
    </State.Provider>
  );
}

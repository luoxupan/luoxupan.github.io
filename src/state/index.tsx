import * as React from "react";
import { reducer, initialState } from './reducer';
import { CommonRequest } from 'httprequest';

export const State = React.createContext({} as any);

export function StateProvider(props: any) {
  const { children } = props;
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    // 初始化全局公有的数据国家、城市等
    Promise.all([
      CommonRequest.getCountries(),
    ]).then((res: any) => {
      dispatch({ type: 'update', data: { countries: res[0]?.data } });
    });
  }, []);

  return (
    <State.Provider value={{ state, dispatch }}>
      {children}
    </State.Provider>
  );
}

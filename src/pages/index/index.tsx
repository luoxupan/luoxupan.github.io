import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { State } from 'state';
import './index.less';

export function IndexPage() {

  let location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  console.log('useSearchParams:', searchParams.get('id'));
  console.log('location:', location);
  const { state, dispatch } = React.useContext(State);
  console.log('state:', state);

  return (
    <div className="main-page">
      <div>首页</div>
    </div>
  );
};

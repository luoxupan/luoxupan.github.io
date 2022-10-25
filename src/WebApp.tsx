import * as React from "react";
import './WebApp.less';
import { Outlet } from "react-router-dom";
import { StateProvider } from 'state';
import { LayoutLeft } from 'components';

export function WebApp() {
  return (
    <StateProvider>
      <div className="web-app">
        <LayoutLeft />
        <div className="layout-main">
          <Outlet />
        </div>
      </div>
    </StateProvider>
  );
}

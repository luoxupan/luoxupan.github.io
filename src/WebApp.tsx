import * as React from "react";
import './WebApp.less';
import { Outlet } from "react-router-dom";
import { StateProvider } from 'state';
import { LayoutLeft, ErrorBoundary } from 'components';

export function WebApp() {
  return (
    <StateProvider>
      <ErrorBoundary>
        <div className="web-app">
          <LayoutLeft />
          <div className="layout-main">
            <Outlet />
          </div>
        </div>
      </ErrorBoundary>
    </StateProvider>
  );
}

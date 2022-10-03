import * as React from "react";
import './WebApp.less';
import { Outlet, Link } from "react-router-dom";
import { StateProvider } from 'state';

export function WebApp() {
  return (
    <StateProvider>
      <div className="web-app">
        <div className="layout-left">
          <Link to={`undoredo`}>undo redo</Link>
          <Link to={`options`}>Options</Link>
          <Link to={`notfound`}>Not Found</Link>
        </div>
        <div className="layout-main">
          <Outlet />
        </div>
      </div>
    </StateProvider>
  );
}

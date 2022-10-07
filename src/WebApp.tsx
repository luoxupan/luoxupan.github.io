import * as React from "react";
import './WebApp.less';
import { Outlet, Link } from "react-router-dom";
import { StateProvider } from 'state';

export function WebApp() {
  console.log('WebApp::=::');
  return (
    <StateProvider>
      <div className="web-app">
        <div className="layout-left">
          <Link to={`/page/undoredo`}>undo redo</Link>
          <Link to={`/page/options`}>Options</Link>
          <Link to={`/page/notfound`}>Not Found</Link>
        </div>
        <div className="layout-main">
          <Outlet />
        </div>
      </div>
    </StateProvider>
  );
}

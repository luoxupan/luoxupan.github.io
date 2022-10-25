import "./index.less";
import * as React from "react";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';

export function LayoutLeft(props: any) {
  let location = useLocation();
  return (
    <div className="layout-left">
      <Link to={`/`}>index page</Link>
      <Link to={`/undoredo`}>undo redo</Link>
      <Link to={`/options`}>Options</Link>
      <Link to={`/notfound`}>Not Found</Link>
    </div>
  );
}

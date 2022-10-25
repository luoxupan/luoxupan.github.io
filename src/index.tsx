import * as React from "react";
import { createRoot } from "react-dom/client";
import { router } from './router';
import 'antd/dist/antd.less';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";

createRoot(
  document.body as HTMLElement
).render(
  // <React.StrictMode> TODO: 此标签会导致组件mount两次
  // https://github.com/facebook/react/blob/main/CHANGELOG.md#breaking-changes
    <RouterProvider router={createBrowserRouter(
      router, {
        basename: '/page',
      }
    )} />
  // </React.StrictMode>
);

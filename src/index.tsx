import * as React from "react";
import { createRoot } from "react-dom/client";
import { router } from './router';
import 'antd/dist/antd.css';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";

createRoot(
  document.body as HTMLElement
).render(
  <React.StrictMode>
    <RouterProvider router={createBrowserRouter(
      router, {
        basename: '/page',
      }
    )} />
  </React.StrictMode>
);

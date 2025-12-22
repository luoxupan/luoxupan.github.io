import * as React from "react";
import { createRoot } from "react-dom/client";
import { router } from './router';
import 'antd/dist/antd.less';
import {
  // createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

createRoot(
  document.querySelector('#app') as HTMLElement
).render(
  // <React.StrictMode> TODO: 此标签会导致组件mount两次
  // https://github.com/facebook/react/blob/main/CHANGELOG.md#breaking-changes
  // @ts-ignore
  <DndProvider backend={HTML5Backend}>
    <RouterProvider router={createHashRouter(
      router, {
        basename: '/',
      }
    )} />
  </DndProvider>
    // <HashRouter>{renderRoutes(router)}</HashRouter>
  // </React.StrictMode>
);

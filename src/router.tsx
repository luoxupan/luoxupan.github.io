import * as React from "react";
import { WebApp } from "./WebApp";
import { ErrorPage } from './pages/error-page';
import { Options, UndoRedo } from './components/index';

function LoadPage(props: any) {
  const { loader } = props;
  const Page = React.lazy(loader);

  return (
    <React.Suspense fallback={(
      <div>加载中...</div>
    )}>
      <Page />
    </React.Suspense>
  );
}

export const router = [
  {
    path: "/",
    element: <WebApp />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <div>
            index page
          </div>
        ),
      },
      {
        path: "undoredo/",
        // element: <UndoRedo />,
        element: <LoadPage loader={() => import('./pages/TestPage')} />,
      },
      {
        path: "options/",
        element: <Options />,
      },
    ],
  },
] as any;

import * as React from "react";
import { WebApp } from "./WebApp";
import { ErrorPage } from './pages/error-page';
import { Options } from './components/index';
import { IndexPage } from './pages/index';

function LoadPage(props: any) {
  const { loader } = props;
  const Page = React.lazy(loader);

  return (
    <React.Suspense fallback={(
      <div>Loading...</div>
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
        element: <IndexPage />,
      },
      {
        path: "undoredo/",
        element: <LoadPage loader={() => import('./pages/TestPage')} />,
      },
      {
        path: "options/",
        element: <Options />,
      },
    ],
  },
] as any;

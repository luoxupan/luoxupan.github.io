import * as React from "react";
import { QueryClient } from './queryClient'

interface Options {
  queryKey: any[];
  queryFn: Function;
  enabled?: Boolean;
}

export function useQuery(options: Options) {
  const { queryKey, queryFn, enabled } = options;
  const queryClient = React.useRef(new QueryClient());
  // 存储接口数据
  const [state, setState] = React.useState(undefined as any);

  React.useEffect(() => {
    if (enabled || enabled === undefined) {
      // 获取接口数据
      queryClient.current.fetchQuery();
    }
  }, [...options.queryKey]);

  return {
    response: state,
    queryClient: queryClient.current,
  };
}

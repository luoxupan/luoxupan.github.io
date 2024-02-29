import * as React from "react";
import { QueryClient } from './queryClient'

interface Options {
  queryKey: any[];
  queryFn: Function;
  enabled: Boolean;
}

export function useQuery(options: Options) {
  const { queryKey, queryFn, enabled } = options;
  // 存储接口数据
  const [state, setState] = React.useState(undefined as any);

  const defaultedOptions = QueryClient.defaultQueryOptions(options);

  React.useEffect(() => {
  }, [defaultedOptions]);

  return {
    response: state,
    queryClient: QueryClient,
  };
}

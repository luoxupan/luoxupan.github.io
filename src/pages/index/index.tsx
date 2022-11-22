import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { State } from 'state';
import { Button } from 'antd';
import './index.less';

export function IndexPage(props: any) {

  let location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  console.log('useSearchParams:', searchParams.get('id'));
  const { state, dispatch } = React.useContext(State);
  const [showName, setShowName] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      // console.log('props:props', props)
      console.log('props:', props.data.data_name);
    }, 2000);
  } ,[]);

  return (
    <div className="main-page">
      {showName && <div>name: {props.props.name}</div>}
      <Button
        onClick={() => {
          setShowName(true);
        }}
      >
        Show Name
      </Button>
      <div>首页</div>
    </div>
  );
};

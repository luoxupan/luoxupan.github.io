import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { State } from 'state';
import { Button } from 'antd';
import './index.less';
import html2canvas from '../../html2canvas';
import { useQuery } from '../../hooks';

export function IndexPage(props: any) {

  let location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  // console.log('useSearchParams:', searchParams.get('id'));
  const { state, dispatch } = React.useContext(State);
  const [showName, setShowName] = React.useState(false);
  const [count, setCount] = React.useState(1);

  React.useEffect(() => {
    // setTimeout(() => {
    //   // console.log('props:props', props)
    //   console.log('props:', props.data.data_name);
    // }, 2000);
  } ,[]);
  const query = useQuery({ queryKey: [count], queryFn: () => {}});
  console.log('query:', query);

  return (
    <div className="main-page">
      {showName && <div>name: {props.data.name}</div>}
      {/* {showName && <div>name: {'props.data.name'}</div>} */}
      <Button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        点击增加
      </Button>
      <Button
        onClick={() => {
          setShowName(true);
        }}
      >
        点击Crash
      </Button>
      <Button
        onClick={() => {
          html2canvas(document.body).then(function(canvas: any) {
            const imgData = canvas.toDataURL('image/png');
      
            const img: any = document.createElement('img');
            img.style = "width: 100%";
            img.src = imgData;
      
            document.body.appendChild(img);
          });
        }}
      >
        点击生成图片
      </Button>
    </div>
  );
};

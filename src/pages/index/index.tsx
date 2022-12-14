import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { State } from 'state';
import { Button } from 'antd';
import './index.less';
import html2canvas from '../../html2canvas';

export function IndexPage(props: any) {

  let location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  console.log('useSearchParams:', searchParams.get('id'));
  const { state, dispatch } = React.useContext(State);
  const [showName, setShowName] = React.useState(false);

  React.useEffect(() => {
    // setTimeout(() => {
    //   // console.log('props:props', props)
    //   console.log('props:', props.data.data_name);
    // }, 2000);
  } ,[]);

  return (
    <div className="main-page">
      {showName && <div>name: {props.data.name}</div>}
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

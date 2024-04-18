import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { State } from 'state';
import { Button } from 'antd';
import './index.less';
import html2canvas from '../../html2canvas';
import { useQuery } from '../../hooks';
import { IndexDB } from '../../utils';

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
          // @ts-ignore
          window.IndexDB = IndexDB;
          IndexDB.init().then(() => {
            IndexDB.set('/optimusChannel/preLoadData', {
              timestamp: Date.now(),
              params: {},
              response: {"status":0,"data":{"userInfo":{"uid":369436512018641,"uidStr":"369436512018641","cell":"00016111882","role":1,"email":null,"originId":1,"i18nInfo":{"countryCode":"+52","lang":null,"utcOffset":null},"emailStatus":null,"requesterType":1,"countryCodeNum":"+52"},"utcOffset":-360,"portalVerifyResult":true,"cityid":"52080200","pageList":[{"id":8,"name":"Viaje","icon":"http://img0.didiglobal.com/static/csglobal/optimus/nav_icon_ride_unsel_2x.png","businessModalityId":1,"userTypeId":1,"pageType":"3","defaultPage":true}],"orderSelectTitle":"Elige otro viaje","canonicalCountryCode":"MX","orderConfirmTitle":"Confirma el problema y el viaje"},"error":null,"errors":null,"traceId":"0a0f162f6620fc64475b75c90fb33302"},
            });
          });
        }}
      >
        IndexDB设置数据
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

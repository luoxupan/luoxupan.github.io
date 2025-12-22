import * as React from 'react';
import { JsonEdit } from './JsonEdit';

export const JsonView = (props: any) => {
  const { src, style } = props;
  const eleRef = React.useRef(null as any);

  React.useEffect(() => {
    eleRef?.current?.setValue?.(src || {});
  }, [src]);

  return (
    <div className='json-view'>
      <JsonEdit ref={eleRef} readOnly={true} style={style}/>
    </div>
  );
};

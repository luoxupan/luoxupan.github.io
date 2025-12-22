import { Input, Button } from 'antd';
import * as React from 'react';

export const FmpUniID = (props: any) => {

  const { onChange, disabled } = props;

  // 获取唯一 id
  const getExtraRegion = async () => {
    const { errno, data } = await ({} as any).getExtraRegion();
    if (errno === 0) {
      onChange(data?.id)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <Input
        style={{ width: '100%' }}
        {...(props as any)}
      />

      {!disabled && <Button style={{ marginLeft: 24 }} onClick={getExtraRegion}>添加</Button>}
    </div>
  );
}
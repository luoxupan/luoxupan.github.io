import { Input, Button } from 'antd';
import * as React from 'react';

export default function () {
  const [value, setValue]: any = React.useState();

  // 获取唯一 id
  const getExtraRegion = async () => {
    const { errno, data } = await ({} as any).getExtraRegion();
    if (errno === 0) {
      setValue(data?.id)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '50%' }}>
      <Input
        style={{ width: '100%' }}
        value={value}
        onChange={e => {
          setValue(e?.target?.value)
        }}
      />

      <Button style={{ marginLeft: 24 }} onClick={getExtraRegion}>添加</Button>
    </div>
  );
}
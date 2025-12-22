import * as React from 'react';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default function (props: any) {
  const { path, setPath, index} = props;
  return (
    <div style={{ width: '100%' }}>
      <Button
        style={{ float: 'right', marginRight: 120 }}
        onClick={(e) => {
          setPath([...path, index]);
          e.stopPropagation();
        }}>
          <EditOutlined style={{ marginRight: 5 }} />
          {'编辑'}
      </Button>
    </div>
  );
}
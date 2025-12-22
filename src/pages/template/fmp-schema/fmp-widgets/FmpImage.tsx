import { Modal, message, Input } from 'antd';
import * as React from 'react';

export const FmpImage = React.forwardRef((props: any, ref: any) => {
  const { value } = props;
  const [preview, setPreview] = React.useState(false as any);

  React.useImperativeHandle(ref, () => ({
    labelClick: () => {
      if (value?.length > 0) {
        setPreview(true);
      } else {
        message.error('please input img url');
      }
    },
  }));

  return (
    <>
      <Input {...(props as any)} type='input' autoComplete="off" />
      <Modal style={{
          height: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} visible={preview} width={1000} footer={null} onCancel={() => setPreview(false)}>
        <img alt="example" style={{ width: '100%' }} src={value} />
      </Modal>
    </>
  );
})
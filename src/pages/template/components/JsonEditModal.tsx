import { Modal, Button } from 'antd';
import * as React from 'react';
import { JsonEdit } from './JsonEdit';
import { message } from 'antd';
import './JsonEditModal.less';

export function JsonEditModal(props: any) {
  const { visible, onOk, onCancel, data, readOnly } = props;

  const eleRef = React.useRef(null as any);

  React.useEffect(() => {
    if (visible && data) {
      eleRef?.current?.setValue?.(data);
    }
  }, [visible]);

  let footer = (
    <>
      <Button
        onClick={() => {
          onCancel();
        }}>Cancel</Button>
      {!readOnly && <Button
        type='primary'
        onClick={() => {
          try {
            onOk?.(eleRef?.current?.getValue?.());
            onCancel();
          } catch (error) {
            message.error('json parse failed');
          }
        }}>Ok</Button>}
    </>
  );

  return (
    <Modal
      width={850}
      visible={visible}
      footer={footer}
    >
      <JsonEdit ref={eleRef} readOnly={readOnly} />
    </Modal>
  );
}

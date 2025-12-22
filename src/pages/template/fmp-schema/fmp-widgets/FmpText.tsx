import { Input, message, Modal, Button, Descriptions } from 'antd';
import * as React from 'react';

export const FmpText = React.forwardRef((props: any, ref: any) => {

  const { value } = props

  const [list, setList]: any = React.useState({ data: null, key : '' });

  React.useImperativeHandle(ref, () => ({
    labelClick: async () => {
      if (value?.length > 0) {
        const res = await ({} as any).getI18nName({ key: value });
        const { errno, errmsg, data } = res
        if (errno === 0) {
          setList(data)
        } else {
          message.error(errmsg)
        }
      }
    },
  }));

  return (
    <>
      <Input {...(props as any)} autoComplete="off" />
      <Modal
        open={list?.data}
        title={'I18n文案展示'}
        width={800}
        centered
        footer={<Button
          type='primary'
          onClick={() => {
            setList({ data: null, key : '' });
          }}>
          {"确认"}
        </Button>}
      >
        <Descriptions
          style={{ height: 500 }}
          bordered
          column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
        >
          {(list?.data || []).map((item: any) => {
            return <Descriptions.Item key={item.lang} label={item.lang}>{item.value}</Descriptions.Item>
          })}
        </Descriptions>
      </Modal>
    </>
  );
});
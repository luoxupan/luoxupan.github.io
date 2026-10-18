import { Button, Modal, Input } from 'antd';

import * as React from 'react';
import './index.less';
import * as qs from 'querystring';
import { FmpForm } from './fmp-schema/fmp-form/index';
import { Template } from './fmp-schema/index';
import {
  getSchemaField,
  FormatTemplateData
} from './fmp-schema/utils';
import { JsonView } from './components/JsonView';
import { EyeOutlined } from '@ant-design/icons';
import { tempjson } from './temp';

export function TemplatePage(props: any) {

  const { history, location } = props;

  let { tmpl_id, type, feature_id }: any = qs.parse(window.location.search?.slice?.(1) || '');

  const tempRef = React.useRef(null as any);

  const [saveTemp, setSaveTemp]: any = React.useState(false);
  const [visible, setVisible]: any = React.useState(false);
  const [textarea, setTxtarea]: any = React.useState('');
  const [detailData, setDetailData]: any = React.useState({} as any);
  const [jsonData, setJsonData]: any = React.useState(null as any);
  const [activePreviewButton, setActivePreviewButton]: any = React.useState('previewForm');

  const tempFormRef = React.useRef(null as any);

  const saveTemplate = async () => {
    try {
      // 规则约束表单校验
      await tempRef.current?.getRulesValidate()
      // 自定义组件
      const formData = tempRef.current.getFormData();
    } catch (e) {
      console.log(e)
    }
  }

  const showJsonData = () => {
    const schema = tempRef.current.getFormData();
    setJsonData(getSchemaField(schema, {}));
  };

  const showForm = () => {
    setJsonData(null);
  };

  const selectPreviewButton = (key: string) => {
    setActivePreviewButton(key);
  };

  React.useEffect(() => {
    (async () => {
      // 需要区分是不是多details模版，再进行赋值和初始化
      if (tmpl_id) {
        const { data } = { data: { } as any };
        const { multi_detail_param, data: templateData } = data || {};

        tempRef.current.setFormData(FormatTemplateData(multi_detail_param, templateData?.properties) || []);
        setDetailData(data);
      }
    })();
    tempRef.current.setFormData(tempjson);
    setDetailData(tempjson);
  }, [tmpl_id]);

  return (
    <div
      {...props}
      loading={false}
      name="template"
      className='template-page'
    >
      <div className='header-top'>
        <Button
          type='primary'
          onClick={() => {
            setVisible(true);
            // 模拟的数据
            // setVisible(true);
            // const _cards = [{"type":"Object","subType":"Array","name":"obj_arr","label":"通用字段","label_en":"","items":[{"type":"String","subType":"Input","name":"a_1","label":"通用字段","label_en":"","items":[],"required":false,"dataSource":{"enum":[]},"id":1,"active":false},{"type":"Number","subType":"InputNumber","name":"a_2","label":"通用字段","label_en":"","items":[],"required":false,"dataSource":{"enum":[]},"id":2,"active":true}],"required":false,"dataSource":{"enum":[]},"id":4,"active":true},{"type":"Object","subType":"Object","name":"obj","label":"对象","label_en":"","items":[{"type":"Number","subType":"InputNumber","name":"obj_2","label":"通用字段","label_en":"","items":[],"required":false,"dataSource":{"enum":[]},"id":2,"active":true},{"type":"String","subType":"Input","name":"obj_f_1","label":"通用字段","label_en":"","items":[],"required":false,"dataSource":{"enum":[]},"id":1,"active":false}],"required":false,"dataSource":{"enum":[]},"id":3,"active":false},{"type":"String","subType":"NormalArray","name":"arr","label":"字符串数组","label_en":"","items":[],"required":false,"dataSource":{"enum":[]},"id":2,"active":false},{"type":"String","subType":"Input","name":"sd","label":"通用字段","label_en":"","items":[],"required":false,"dataSource":{"enum":[]},"id":1,"active":false}];
            // const data = {"obj_arr":[{"a_1":"fdgdf","a_2":555}],"obj":{"obj_2":666,"obj_f_1":"ghfjhjhg"},"arr":["gg","jj"],"sd":"vvbbn"};
            // form.setFieldsValue(data);
            // tempRef.current.setFormData(_cards);
          }}>
          <EyeOutlined style={{ marginRight: 5 }} />
          {'预览'}
        </Button>
      </div>
      <Template ref={tempRef} disabled={type === 'audit'} />
      <div className='preview' style={{ display: visible ? 'flex' : 'none' }}>
        <div className='ant-modal-mask'></div>
        <div className='ant-modal-wrap main'>
          <div className='top-bar'>
            <Button
              style={{ marginLeft: 10 }}
              type={activePreviewButton === 'getFormData' ? 'primary' : 'default'}
              disabled={jsonData !== null}
              onClick={() => {
                selectPreviewButton('getFormData');
                console.log(tempFormRef.current.getFieldsValue());
              }}>获取Form数据</Button>
            <Button
              style={{ marginLeft: 10 }}
              type={activePreviewButton === 'validateForm' ? 'primary' : 'default'}
              disabled={jsonData !== null}
              onClick={async () => {
                selectPreviewButton('validateForm');
                const formData = await tempFormRef.current.validateFields();
              }}>校验必填项</Button>
            <Button
              style={{ marginLeft: 10 }}
              type={activePreviewButton === 'json' ? 'primary' : 'default'}
              onClick={() => {
                selectPreviewButton('json');
                showJsonData();
              }}>{'查看json数据结构'}</Button>
            <Button
              style={{ marginLeft: 10 }}
              type={activePreviewButton === 'previewForm' ? 'primary' : 'default'}
              onClick={() => {
                selectPreviewButton('previewForm');
                showForm();
              }}>{'预览表单'}</Button>
            <i
              className='close-icon'
              onClick={() => {
                setVisible(false);
                setJsonData(null);
                setActivePreviewButton('previewForm');
              }}>
              <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
              </svg>
            </i>
          </div>
          <div className='content'>
            {jsonData && <JsonView src={jsonData} />}
            {visible && !jsonData && <FmpForm ref={tempFormRef} schema={tempRef.current.getFormData()} rules={tempRef.current?.getRulesData() || {}} />}
          </div>
        </div>
      </div>
      <Modal
        centered
        width={900}
        footer={null}
        title={(
          <div style={{ width: 850 }}>
            <span>版本描述：</span>
            <Button
              type="primary"
              style={{ float: 'right', marginLeft: 20 }}
              onClick={async () => {
              }}>{'保存'}</Button>
            <Button
              style={{ float: 'right' }}
              onClick={() => {
                setSaveTemp(false);
              }}>{'取消'}</Button>
          </div>
        )}
        open={saveTemp}
      >
        <Input.TextArea onChange={v => {
          setTxtarea(v?.target?.value || '')
        }} />
        <div style={{ width: '100%', height: 80 }}></div>
      </Modal>
    </div>
  );
}

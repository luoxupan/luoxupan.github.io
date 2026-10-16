import * as React from 'react';
import './index.less';
import { Form, Tooltip } from 'antd';
import { getSubType, isBaseField } from '../type';
import { FmpFieldsForms } from '../fmp-widgets/FmpObject';

const lang = 'zh-CN';

export function renderItems(schema: any, disabled: any, count: any) {
  return (
    <>
      {schema.map((field: any, index: any) => {
        const { type, subType, name, label, label_en, items, required, icon, defaultData, config, labelCol, linkage, canLinkage } = field;
        const isObject = !isBaseField(type, subType);
        const _Type = getSubType(type, subType);
        let eleRef: any = React.createRef();

        const rules: any = [{ required: required || false, message: `请填写${label}` }];
        if ('validator' in _Type) {
          rules.push({ validator: _Type.validator(config) });
        }

        const _props = {
          key: index,
          name: name,
          rules: rules,
          tooltip: !icon ? null : icon,
          // style: { display: isObject ? 'block' : 'flex' },
          className: isObject ? 'form-item-object' : '',
          label: (
            <div className={isObject ? 'form-item-object-label' : 'label'}>
              {lang === 'zh-CN' ? label : label_en || label || label_en}:
            </div>
          ),
          initialValue: disabled ? undefined : (!config ? defaultData : config?.defaultValue),
          labelCol
        } as any;

        if (type === 'Boolean' && subType === 'Switch') {
          // TODO: Boolean类型默认值为false 现在写死以后扩展

          // 新增默认值可匹配逻辑
          _props.initialValue = (!config ? defaultData : config?.defaultValue) || false;
        }

        if (('Number' === type && 'MultilSelect' === subType)) {
          _props.getValueFromEvent = (event: any) => {
            let newVal = event?.map((it: any) => Number(it)) || []
            return newVal
          }
        }

        const formItemLabel = _Type?.props?.label && _Type?.props?.label(config);
        return (
          <>
            <Form.Item
              {..._props}
              colon={false}
              extra={formItemLabel &&
                <a
                  onClick={(e) => {
                    eleRef?.current?.labelClick();
                  }}
                  style={{ fontSize: 10, marginLeft: 10 }}
                >
                  {formItemLabel}
                </a>
              }
            >
              <_Type.SchemaComponent
                {...(disabled ? {} : config)}
                {..._Type.props}
                ref={eleRef}
                count={count + 1}
                disabled={disabled}
                {...field}
                schema={items}
                renderItems={renderItems}
              />
            </Form.Item>
            {!!canLinkage && <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const linkageValue = getFieldValue(name);

                return renderItems(linkage?.[linkageValue] || [], disabled, count);
              }}
            </Form.Item>}
          </>
        );
      })}
    </>
  );
};

export const FmpForm = React.forwardRef((props: any, ref: any) => {
  let { schema, disabled, data, getRestItems } = props;
  const gridRef = React.useRef<any>(null);
  //处理滚动事件
  const handleScroll = (e: Event, stand: number) => {
    let scrollTop = (e.target as HTMLElement).scrollTop;
    if (stand - scrollTop < 1500) {
      getRestItems && getRestItems()
    }
  }
  React.useEffect(() => {
    if (data && data.questions && Array.isArray(data.questions)) {
      const containerHeight = (gridRef.current as unknown as Element).scrollHeight;
      if (containerHeight > 800) {
        gridRef.current && (gridRef.current as unknown as Element).addEventListener('scroll',
        (e: Event) => {
          if (data.questions && Array.isArray(data.questions)) {
            handleScroll(e, (gridRef.current as unknown as Element).scrollHeight);
          }
        });
      } else {
        getRestItems && getRestItems()
      }
    }
  }, [data])

  const [form] = Form.useForm();

  React.useImperativeHandle(ref, () => ({
    get data() {
      return form.getFieldsValue();
    },
    validateFields: async () => {
      const forms: any = [];
      for (let i = 0; i < FmpFieldsForms.length; ++i) {
        forms.push(FmpFieldsForms[i].validateFields());
      }
      await Promise.all(forms);
      return form.getFieldsValue();
    },
    getFieldsValue: () => {
      return form.getFieldsValue();
    },
    setFieldsValue: (data: any) => {
      form.setFieldsValue(data);
    },
  }));

  React.useEffect(() => {
    // 这个useEffect主要是收集form表单实例  提交时校验表单需要用到
    if (!FmpFieldsForms.includes(form)) {
      FmpFieldsForms.push(form);
    }
    return () => {
      const idx = FmpFieldsForms.indexOf(form);
      if (idx !== -1) {
        FmpFieldsForms.splice(idx, 1);
      }
    };
  }, []);

  React.useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data]);
  try {
    return (<>
      <Form layout='horizontal' form={form} className='fmp-schema-form'>
        <div
          ref={gridRef}
          style={{
            maxHeight: '800px',
            // overflowY: 'scroll',
          }}
        >
          {renderItems(schema, disabled, 1)}
        </div>
      </Form>
    </>);
  } catch (error) {
    console.error('error:', error);
    return (
      <div style={{ color: 'red', fontSize: 16 }}>
        {
          // @ts-ignore
          error.message
        }
      </div>
    );
  }
});

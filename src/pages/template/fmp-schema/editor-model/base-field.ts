import FormInput from './auto-form/FormInput';
import FormKeyInput from './auto-form/FormKeyInput';
import FormSwitch from './auto-form/FormSwitch';
import FormType from './auto-form/FormType';
import FormStyleType from './auto-form/FormStyleType';
import FormDataSource from './auto-form/FormDataSource';
import FormModeType from './auto-form/FormModeType';
import FormConfig from './auto-form/FormConfig';
import FormSwitchCustomSelect from './auto-form/FormSwitchCustomSelect';
import FormLinkageSwitch from './auto-form/FormLinkageSwitch';
import FormAutowitch from './auto-form/FormLinkageSwitch';
import { getStyleType } from './../type';

export default {
  label: '基础信息',
  formItems: [
    {
      label: 'key',
      modelKey: 'name',
      component: FormKeyInput,
      rules: [
        { pattern: /^[0-9a-zA-Z_]{1,}$/, message: '仅支持数字英文和_(下划线)' }
      ],
      validator: (parrentKey: any, automaticKey: any) => {
        return async (_: any, v: any) => {
          // 如果父组件是联动组件且支持自动拼接key，那么将父组件的key删除，然后判断key是否为空
          if (!!parrentKey && !!automaticKey) {
            if (!(v || '')?.slice(0)?.replace(`${parrentKey}_`, '')) {
              throw new Error('请输入');
            }
          } else {
            if (!v) {
              throw new Error('请输入');
            }
          }
        }
      },
      disabled: (label: any, disabled: any) => {
        return label === 'key' ? disabled : false
      }
    },
    {
      label: '标题',
      modelKey: 'label',
      component: FormInput,
      rules: [
        { required: true, message: '请输入' },
      ]
    },
    {
      label: '标题（en-US）',
      modelKey: 'label_en',
      component: FormInput,
      rules: [
        { required: true, message: '请输入' },
      ]
    },
    {
      label: '是否必填',
      modelKey: 'required',
      component: FormSwitch
    },
    {
      label: '提示信息',
      modelKey: 'icon',
      component: FormInput
    },
    {
      label: '类型',
      modelKey: 'type',
      component: FormType
    },
    {
      label: '组件配置',
      modelKey: 'config',
      component: FormConfig,
      hidden: ({ type, subType }: any) => {
        if (!(('Number' === type && 'InputNumber' === subType) || ('String' === type && 'Input' === subType) || ('Boolean' === type && 'Switch' === subType))) {
          return true
        }
      }
    },
    {
      label: '样式',
      modelKey: 'subType',
      component: FormStyleType,
      hidden: ({ type }: any) => {
        const options = getStyleType(type) || [];

        if (options.length === 0) {
          return true;
        }
      }
    },
    {
      label: '模式',
      modelKey: 'mode',
      component: FormModeType,
      hidden: ({ subType }: any) => {
        if (subType !== 'Select') {
          return true;
        }
      }
    },
    {
      label: '组件联动',
      modelKey: 'canLinkage',
      component: FormLinkageSwitch,
      hidden: ({ subType, mode }: any) => !('Switch' === subType || 'Select' === subType &&mode === 'radio')
    },
    {
      label: '自动拼接key',
      modelKey: 'automaticKey',
      component: FormAutowitch,
      hidden: (_: any, canLinkage: any) => !canLinkage
    },
    {
      label: '支持自定义数据',
      modelKey: 'customSelectData',
      component: FormSwitchCustomSelect,
      hidden: ({ subType, mode }: any) => {
        if (subType !== 'Select' || mode !== 'select') {
          return true;
        }
      }
    },
    {
      label: '数据源',
      modelKey: 'dataSource',
      component: FormDataSource,
      rules: [
        {
          validator: async (r: any, v: any) => {
            v?.enum?.map((it: any) => {
              const { value, label } = it;
              if ((!value && value !== 0) || !label?.trim() || !label) {
                throw new Error('请将数据源信息填写完整')
              }
            })
          }
        }
      ],
      hidden: ({ subType }: any) => {
        if (!['Select', 'MultilSelect'].includes(subType)) {
          return true;
        }
      }
    },
  ],
}

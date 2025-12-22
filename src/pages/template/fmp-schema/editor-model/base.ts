import FormInput from './auto-form/FormInput';
import FormKeyInput from './auto-form/FormKeyInput';
import FormSwitch from './auto-form/FormSwitch';

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
  ],
}

import * as React from 'react';
import { cloneDeep } from 'lodash';

export default function ComponentCard(props: any) {
  const { cards, setCards, config } = props;
  const { Icon, label } = config;
  return (
    <div
      className='widget-card'
      onClick={() => {
        const _cards = [...cards];
        _cards.forEach((item) => item.active = false);
        const _data: any = { ...cloneDeep(config), name: '', label: config.label, label_en: '', required: false, icon: '' };
        // _cards.push({ ..._data, id: Math.max(..._cards.map(({ id }) => id), 0) + 1, active: true });
        _cards.push({ ..._data, id: new Date().getTime(), active: true });
        setCards(_cards);
      }}
    >
      {<Icon style={{ display: 'flex' }} />}
      {label}
    </div>
  )
}


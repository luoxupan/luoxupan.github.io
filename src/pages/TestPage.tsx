import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { UndoRedo, SvgIcon } from 'components';
import { State } from 'state';
import * as FBImg from '../assets/imgs/feedback.png';

export default React.memo(function TestPage() {

  let location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  console.log('useSearchParams:', searchParams.get('id'));
  console.log('location:', location);
  const { state, dispatch } = React.useContext(State);
  console.log('state:', state);

  return (
    <div id="test-page">
      <button
        onClick={() => {
          dispatch({ type: 'update', data: { city: ['sr'] } });
        }}
      >
        Click
      </button>
      <img src={FBImg} />
      <SvgIcon name={'search'} />
      <UndoRedo />
    </div>
  );
});

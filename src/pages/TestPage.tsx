import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { UndoRedo } from '../components/index';
import { State } from 'state';
import * as FBImg from '../assets/imgs/feedback.png';
import * as SearchSVG from '../assets/svg/search.svg';

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
          dispatch({ type: 'CITY', data: ['sr'] });
        }}
      >
        Click
      </button>
      <h1>test page!</h1>
      <img src={FBImg} />
      <img src={SearchSVG} />
      <UndoRedo />
    </div>
  );
});

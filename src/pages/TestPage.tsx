import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';
import { UndoRedo } from '../components/index';

export default function TestPage() {

  let location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  console.log('useSearchParams:', searchParams.get('id'));
  console.log('location:', location);

  return (
    <div id="test-page">
      <h1>test page!</h1>
      <UndoRedo />
    </div>
  );
}
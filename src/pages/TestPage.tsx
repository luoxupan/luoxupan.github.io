import * as React from "react";
import { useSearchParams, useLocation } from 'react-router-dom';

export default function TestPage() {

  let location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  console.log('useSearchParams:', searchParams.get('id'));
  console.log('location:', location);

  return (
    <div id="test-page">
      <h1>test page!</h1>
    </div>
  );
}
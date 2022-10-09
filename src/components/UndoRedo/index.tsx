import "./index.less";
import * as React from "react";
import { useUndoRedo } from "../../hooks/index";
import { UndoOutlined, RedoOutlined } from "@ant-design/icons";

export function UndoRedo() {
  const {
    state,
    setState,
    undo,
    redo,
    isUndoPossible,
    isRedoPossible,
    pastStates,
    futureStates
  } = useUndoRedo(0);

  return (
    <div className="undo-redo">
      <h2>React Undo Redo</h2>
      <div className="present">{state}</div>
      <div className="undo-redo-buttons">
        <div>
          <button
            className="increase-button"
            onClick={() => {
              console.log('state:', state + 1);
              setState(state + 1);
            }}
          >
            Increase
          </button>
        </div>
        <div>
          <button
            disabled={!isUndoPossible}
            className="undo-redo-button"
            onClick={() => undo()}
          >
            <UndoOutlined />
          </button>
        </div>
        <div>
          <button
            disabled={!isRedoPossible}
            className="undo-redo-button"
            onClick={() => redo()}
          >
            <RedoOutlined />
          </button>
        </div>
      </div>
      <div className="past">Past: {JSON.stringify(pastStates)} </div>
      <div className="future">Future: {JSON.stringify(futureStates)} </div>
    </div>
  );
}

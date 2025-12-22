import * as React from 'react';

function importScript(sSrc: any) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[id='${sSrc}']`)) {
      resolve(true);
    } else {
      const oScript = document.createElement('script');
      oScript.type = "text\/javascript";
      oScript.onload = resolve;
      oScript.onerror = reject;
      oScript.src = sSrc;
      oScript.id = sSrc;
      document.body.appendChild(oScript);
    }
  });
}
/**
 * 
 * @param props 
 * @returns 
 * 
 * doc: https://ace.c9.io/#nav=api&api=editor
 */
let loadPromise: any = undefined;
export const JsonEdit = React.forwardRef((props: any, ref: any) => {
  const { style, readOnly, onChange } = props;

  const editorRef = React.useRef(null as any);
  const eleRef = React.useRef(null as any);

  React.useImperativeHandle(ref, () => ({
    getValue() {
      const _v = editorRef?.current.getValue();
      try {
        return JSON.parse(_v);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    setValue(data: any) {
      try {
        if (editorRef?.current) {
          editorRef?.current.setValue(JSON.stringify(data, null, 2));
        } else if (loadPromise) {
          loadPromise?.then(() => {
            editorRef?.current.setValue(JSON.stringify(data, null, 2));
          });
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    get editor() {
      return editorRef?.current;
    }
  }));

  React.useEffect(() => {
    const aceUrl = '//luoxupan.github.io/wiki/npm/lib/ace.js';
    const extModelistUrl = '//luoxupan.github.io/wiki/npm/lib/ext-modelist.js';
    loadPromise = Promise.all([
      importScript(aceUrl),
      importScript(extModelistUrl)
    ]).then(() => {
      const _editor = (window as any)?.ace.edit(eleRef.current, {
        mode: "ace/mode/javascript",
        tabSize: 2
      });
      editorRef.current = _editor;
      loadPromise = undefined;
      if (onChange) {
        _editor?.on('change', onChange);
      }
    });
  }, []);

  React.useEffect(() => {
    if (editorRef?.current) {
      editorRef?.current.setReadOnly(readOnly ?? false);
    } else {
      loadPromise?.then(() => {
        editorRef?.current.setReadOnly(readOnly ?? false);
      });
    }
  }, [props, editorRef?.current]);

  return (
    <div ref={eleRef} style={{ height: '70vh', width: '100%', ...style }}>
    </div>
  );
});

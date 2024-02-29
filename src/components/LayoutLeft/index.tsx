import { Button, Modal } from "antd";
import "./index.less";
import * as React from "react";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { record, Replayer } from 'rrweb';
// import { record, Replayer } from '../../../../rrweb/packages/rrweb/src';
let events: any = [];
let stopFn = undefined as any;
export function LayoutLeft(props: any) {
  let location = useLocation();
  const [openModal, setOpenModal] = React.useState(false);
  const modalRef = React.useRef(null as any);

  return (
    <div className="layout-left">
      <Button
        onClick={() => {
          events.length = 0;
          stopFn = record({
            emit(event: any) {
              console.log('events:', event)
              events.push(event);
            },
          });
        }}
      >
        点击录制
      </Button>
      <Button
        onClick={() => {
          stopFn && stopFn();
          stopFn = undefined;
          console.log('event:', { events });
          setOpenModal(true);
          setTimeout(() => {
            const replayer = new Replayer(events, { root: document.querySelector('.ant-modal-body') });
            replayer.play();
          }, 1000)
        }}
      >
        回放
      </Button>
      <Link to={`/`}>index page</Link>
      <Link to={`/undoredo`}>undo redo</Link>
      <Link to={`/options`}>Options</Link>
      <Link to={`/notfound`}>Not Found</Link>
      <Modal
        // ref={(ref: any) => modalRef.current = ref}
        width={'90%'}
        open={openModal}
        onOk={() => {
          setOpenModal(false);
        }}
        onCancel={() => {
          setOpenModal(false);
        }}
      >
      </Modal>
    </div>
  );
}

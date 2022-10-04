import "./SvgUi.less";
import * as React from "react";

export function SvgIcon(props: any) {

  const { url, style } = props;

  React.useEffect(() => {
    url && require(`../../assets/svg/${url}`);
  }, [url]);

  return (
    <svg className="svg-icon" style={{ ...style }}>
      <use xlinkHref={'#search'} />
    </svg>
  );
}

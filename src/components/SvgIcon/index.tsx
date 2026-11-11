import "./index.less";
import * as React from "react";
import "virtual:svg-icons-register";
/**
 * name svg文件名字
 */

interface Props {
  name: string;
  style?: any;
}

export function SvgIcon(props: Props) {

  const { name, style } = props;

  return (
    <svg className="svg-icon" style={{ ...style }}>
      <use xlinkHref={`#${name}`} />
    </svg>
  );
}

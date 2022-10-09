import "./index.less";
import * as React from "react";
/**
 * name svg文件名字
 */

interface Props {
  name: string;
  style?: any;
}

export function SvgIcon(props: Props) {

  const { name, style } = props;

  React.useEffect(() => {
    name && require(`../../assets/svg/${name}.svg`);
  }, [name]);

  return (
    <svg className="svg-icon" style={{ ...style }}>
      <use xlinkHref={`#${name}`} />
    </svg>
  );
}

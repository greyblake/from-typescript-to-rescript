import {SvgIcon, SvgIconProps } from '@mui/material';

import Icon from './svg/inhyped-icon.svg';

function InhypedIcon(props: SvgIconProps) {
    const iconProps = { ...props, component: "object" };
    return (
      <SvgIcon {...iconProps}>
          <embed type="image/svg+xml" src={Icon} style={{ height: "100%" }} />
      </SvgIcon>
    );
}

export { InhypedIcon }

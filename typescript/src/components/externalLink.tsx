import React from 'react';
import { Link } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

interface ExternalLinkProps {
    href: string,
    children: React.ReactNode,
}

function ExternalLink(props: ExternalLinkProps) {
    const { href, children } = props;

    return <Link href={href} target="_blank" rel="noopener" underline="hover">
        {children}
        <LaunchIcon fontSize='small' sx={{verticalAlign: 'middle', marginLeft: '4px'}}/>
    </Link>;
}

export { ExternalLink };

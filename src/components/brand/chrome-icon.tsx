import type { FC, SVGProps } from 'react';

const ChromeIcon: FC<SVGProps<SVGSVGElement>> = props => (
	<svg
		role="img"
		viewBox="0 0 48 48"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		{...props}
	>
		<title>Google Chrome</title>
		<path fill="#ea4335" d="M24 24 44.78 12A24 24 0 0 0 3.22 12Z" />
		<path fill="#34a853" d="M24 24 3.22 12A24 24 0 0 0 24 48Z" />
		<path fill="#fbbc04" d="M24 24 24 48A24 24 0 0 0 44.78 12Z" />
		<circle cx="24" cy="24" r="11" fill="#fff" />
		<circle cx="24" cy="24" r="9" fill="#4285f4" />
	</svg>
);

export default ChromeIcon;

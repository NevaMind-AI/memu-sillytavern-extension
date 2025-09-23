export const EyeIcon = (props: { width?: number; height?: number; color?: string }) => (
	<svg
		width={props.width || 16}
		height={props.height || 16}
		viewBox="0 0 24 24"
		role="img"
		aria-label="Eye"
		style={{ display: 'inline-block', verticalAlign: 'middle' }}
	>
		<path
			d="M12 5C7 5 3.3 8.1 1.5 12c1.8 3.9 5.5 7 10.5 7s8.7-3.1 10.5-7C20.7 8.1 17 5 12 5Zm0 12c-3.1 0-5.5-2.4-5.5-5s2.4-5 5.5-5 5.5 2.4 5.5 5-2.4 5-5.5 5Zm0-8.2c-1.8 0-3.2 1.3-3.2 3.2s1.4 3.2 3.2 3.2 3.2-1.3 3.2-3.2S13.8 8.8 12 8.8Z"
			fill="none"
			stroke={props.color || 'var(--SmartThemeBodyColor)'}
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export default EyeIcon;



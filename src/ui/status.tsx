import { COLORS } from "utils/consts";

export const LoadingIcon = (props: { width?: number, height?: number }) => (
    <svg
        width={props.width || 16}
        height={props.height || 16}
        viewBox="0 0 50 50"
        role="img"
        aria-label="Loading"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#6e7781"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="31.4 188.4"
        >
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="0.8s"
                repeatCount="indefinite"
            />
        </circle>
    </svg>
);

export const SuccessIcon = (props: { width?: number, height?: number }) => (
    <svg
        width={props.width || 16}
        height={props.height || 16}
        viewBox="0 0 50 50"
        role="img"
        aria-label="Success"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#2da44e"
            strokeWidth="5"
            strokeLinecap="round"
        />
        <path
            d="M16 26 L22 32 L34 18"
            fill="none"
            stroke="#2da44e"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const FailIcon = (props: { width?: number, height?: number }) => (
    <svg
        width={props.width || 16}
        height={props.height || 16}
        viewBox="0 0 50 50"
        role="img"
        aria-label="Fail"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#d1242f"
            strokeWidth="5"
            strokeLinecap="round"
        />
        <line x1="17" y1="17" x2="33" y2="33" stroke="#d1242f" strokeWidth="5" strokeLinecap="round" />
        <line x1="33" y1="17" x2="17" y2="33" stroke="#d1242f" strokeWidth="5" strokeLinecap="round" />
    </svg>
);

export const SaveIcon = (props: { width?: number, height?: number }) => (
    <svg
        width={props.width || 16}
        height={props.height || 16}
        viewBox="0 0 50 50"
        role="img"
        aria-label="Save"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <path
            d="M12 12 H34 L38 16 V38 H12 Z"
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="5"
            strokeLinejoin="round"
        />
        <path
            d="M18 14 H28 V24 H18 Z"
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="5"
            strokeLinejoin="round"
        />
        <path
            d="M18 28 H32 V38 H18 Z"
            fill="none"
            stroke={COLORS.primary}
            strokeWidth="5"
            strokeLinejoin="round"
        />
    </svg>
);
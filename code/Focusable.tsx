import * as React from "react"
import { useMemo, useRef, useContext } from "react"
import {
    Direction,
    Focusable as SunbeamFocusable,
    FocusableTreeNode,
    KeyPressListener,
    useSunbeam,
} from "react-sunbeam"
import { addPropertyControls, ControlType, Frame, RenderTarget } from "framer"
import { ScrollContext } from "./ScrollContext"
import { useOnFocusedChange } from "./useOnFocusedChange"

addPropertyControls(Focusable, {
    children: { type: ControlType.ComponentInstance, title: "Child" },
    focusableKey: { type: ControlType.String, title: "Key" },
    tapToFocus: {
        type: ControlType.Boolean,
        title: "Tap to focus",
        defaultValue: false,
    },
    focusProp: {
        type: ControlType.String,
        title: "Focus prop",
    },
    focusPropType: {
        type: ControlType.Enum,
        title: "Focus prop type",
        defaultValue: "string",
        options: ["string", "boolean", "number", "color"],
        optionTitles: ["String", "Boolean", "Number", "Color"],
    },

    focusedValueString: {
        type: ControlType.String,
        title: "Focused value",
        hidden: ({ focusPropType }: Props) => focusPropType !== "string",
    },
    focusedValueBoolean: {
        type: ControlType.Boolean,
        title: "Focused value",
        hidden: ({ focusPropType }: Props) => focusPropType !== "boolean",
    },
    focusedValueNumber: {
        type: ControlType.Number,
        title: "Focused value",
        step: 0.01,
        hidden: ({ focusPropType }: Props) => focusPropType !== "number",
    },
    focusedValueColor: {
        type: ControlType.Color,
        title: "Focused value",
        hidden: ({ focusPropType }: Props) => focusPropType !== "color",
    },

    blurredValueString: {
        type: ControlType.String,
        title: "Blurred value",
        hidden: ({ focusPropType }: Props) => focusPropType !== "string",
    },
    blurredValueBoolean: {
        type: ControlType.Boolean,
        title: "Blurred value",
        hidden: ({ focusPropType }: Props) => focusPropType !== "boolean",
    },
    blurredValueNumber: {
        type: ControlType.Number,
        title: "Blurred value",
        step: 0.01,
        hidden: ({ focusPropType }: Props) => focusPropType !== "number",
    },
    blurredValueColor: {
        type: ControlType.Color,
        title: "Blurred value",
        hidden: ({ focusPropType }: Props) => focusPropType !== "color",
    },

    paddingTop: {
        title: "Top Padding",
        type: ControlType.Number,
        min: -1000,
        max: 1000,
    },
    paddingLeft: {
        title: "Left Padding",
        type: ControlType.Number,
        min: -1000,
        max: 1000,
    },

    onFocus: {
        type: ControlType.EventHandler,
    },
    onBlur: {
        type: ControlType.EventHandler,
    },
    onKeyPress: {
        type: ControlType.EventHandler,
    },
})

interface FocusEvent {
    element: HTMLElement
    focusablePath: ReadonlyArray<string>
}

interface Props {
    width: number
    height: number
    paddingTop: number
    paddingLeft: number
    children:
        | JSX.Element
        | ((args: { focused: boolean; path: readonly string[] }) => JSX.Element)
    tapToFocus?: boolean
    focusableKey?: string
    onFocus?: (event: FocusEvent) => void
    onBlur?: (event: FocusEvent) => void
    onKeyPress?: KeyPressListener
    unstable_getPreferredChildOnFocusReceive?: (args: {
        focusableChildren: Map<string, FocusableTreeNode>
        focusOrigin?: FocusableTreeNode
        direction?: Direction
    }) => FocusableTreeNode | undefined
    getPreferredChildOnFocusReceive?: (args: {
        focusableChildren: Map<string, FocusableTreeNode>
        focusOrigin?: FocusableTreeNode
        direction?: Direction
    }) => FocusableTreeNode | undefined

    focusProp?: string
    focusPropType: "string" | "boolean" | "number" | "color"

    focusedValueString?: string
    focusedValueBoolean?: boolean
    focusedValueNumber?: number
    focusedValueColor?: string

    blurredValueString?: string
    blurredValueBoolean?: boolean
    blurredValueNumber?: number
    blurredValueColor?: string
}

export function Focusable(props: Props) {
    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <Frame
                size="100%"
                background="rgb(45, 42, 46)"
                color="rgb(255, 97, 136)"
                style={{ fontSize: "100px" }}
            >
                F
            </Frame>
        )
    }

    if (RenderTarget.current() === RenderTarget.canvas) {
        return (
            <CanvasPresentation
                width={props.width}
                height={props.height}
                paddingTop={props.paddingTop}
                paddingLeft={props.paddingLeft}
            >
                {typeof props.children === "function"
                    ? props.children({ focused: false, path: [] })
                    : props.children}
            </CanvasPresentation>
        )
    }

    return <PreviewPresentation {...props} />
}

function CanvasPresentation(props: {
    width: number
    height: number
    paddingTop: number
    paddingLeft: number
    children: JSX.Element
}) {
    const { width, height, paddingTop, paddingLeft, children } = props

    return React.Children.count(children) > 0 ? (
        <div
            style={{
                position: "relative",
                top: paddingTop,
                left: paddingLeft,
                width,
                height,
            }}
        >
            {children}
        </div>
    ) : (
        <EmptyStatePlaceholder width={width} height={height}>
            Connect to frame or component
        </EmptyStatePlaceholder>
    )
}

function PreviewPresentation({
    width,
    height,
    paddingTop,
    paddingLeft,
    children,
    focusableKey,
    onFocus,
    onBlur,
    onKeyPress,
    unstable_getPreferredChildOnFocusReceive,
    getPreferredChildOnFocusReceive,

    focusProp,
    focusPropType,

    focusedValueString,
    focusedValueBoolean,
    focusedValueNumber,
    focusedValueColor,

    blurredValueString,
    blurredValueBoolean,
    blurredValueNumber,
    blurredValueColor,

    tapToFocus,
}: Props) {
    const sunbeamContextValue = useSunbeam()
    const setFocus = sunbeamContextValue
        ? sunbeamContextValue.setFocus
        : undefined
    const randomKey = useMemo(
        () => Math.floor(Math.random() * 100000).toString(),
        []
    )
    const scrollContextValue = useContext(ScrollContext)
    const notifyScrollOnFocus = scrollContextValue
        ? scrollContextValue.notifyScrollOnFocus
        : null

    const focusKey = focusableKey || randomKey

    const focusedValue = getFocusedValue(
        focusPropType,
        focusedValueString,
        focusedValueBoolean,
        focusedValueNumber,
        focusedValueColor
    )
    const blurredValue = getBlurredValue(
        focusPropType,
        blurredValueString,
        blurredValueBoolean,
        blurredValueNumber,
        blurredValueColor
    )

    return (
        /* Stop propagation of the scroll context
         because Scroll only cares about the top level Focusable children */
        <ScrollContext.Provider value={null}>
            <SunbeamFocusable
                focusKey={focusKey}
                unstable_getPreferredChildOnFocusReceive={
                    getPreferredChildOnFocusReceive ||
                    unstable_getPreferredChildOnFocusReceive
                }
                onKeyPress={onKeyPress}
            >
                {({ focused, path }) => (
                    <FocusableWrapper
                        width={width}
                        height={height}
                        paddingTop={paddingTop}
                        paddingLeft={paddingLeft}
                        focused={focused}
                        onClick={() => {
                            if (tapToFocus && setFocus)
                                setFocus(path as string[])
                        }}
                        onFocus={element => {
                            if (notifyScrollOnFocus)
                                notifyScrollOnFocus({
                                    boundingBox: element.getBoundingClientRect(),
                                })
                            if (onFocus)
                                onFocus({ element, focusablePath: path })
                        }}
                        onBlur={element => {
                            if (onBlur) onBlur({ element, focusablePath: path })
                        }}
                    >
                        {React.Children.map(
                            typeof children === "function"
                                ? children({ focused, path })
                                : children,
                            child => {
                                if (!focusProp) return child
                                return React.cloneElement(child, {
                                    [focusProp]: focused
                                        ? focusedValue
                                        : blurredValue,
                                })
                            }
                        )}
                    </FocusableWrapper>
                )}
            </SunbeamFocusable>
        </ScrollContext.Provider>
    )
}

function FocusableWrapper({
    width,
    height,
    paddingTop,
    paddingLeft,
    focused,
    onClick,
    onFocus,
    onBlur,
    children,
}: {
    width: number
    height: number
    paddingTop: number
    paddingLeft: number
    focused: boolean
    onClick?: () => void
    onFocus: (element: HTMLElement) => void
    onBlur: (element: HTMLElement) => void
    children: React.ReactNode
}) {
    const elementRef = useRef<HTMLDivElement>(null)

    useOnFocusedChange(focused, isFocused => {
        if (!elementRef.current) return
        if (isFocused) {
            onFocus(elementRef.current)
        } else {
            onBlur(elementRef.current)
        }
    })

    return (
        <div
            ref={elementRef}
            style={{
                width,
                height,
            }}
            onClick={onClick}
        >
            <div
                style={{
                    position: "relative",
                    top: paddingTop,
                    left: paddingLeft,
                    width,
                    height,
                }}
            >
                {children}
            </div>
        </div>
    )
}

function EmptyStatePlaceholder({
    width,
    height,
    children,
}: {
    width: number
    height: number
    children: string
}) {
    return (
        <div
            style={{
                alignItems: "center",
                backgroundColor: "rgba(136, 97, 238, 0.4)",
                border: "1px dashed rgba(136, 97, 238, 0.6)",
                color: "#8861EE",
                display: "flex",
                fontSize: 12,
                flexWrap: "nowrap",
                height,
                justifyContent: "flex-end",
                padding: "10px",
                width,
            }}
        >
            <div
                style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    textAlign: "center",
                    textOverflow: "clip",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                }}
            >
                {children}
            </div>
            <div
                style={{
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    flexGrow: 0,
                    fontSize: "16px",
                }}
            >
                ⟶
            </div>
        </div>
    )
}

function getFocusedValue(
    focusPropType: "string" | "boolean" | "number" | "color",
    focusedValueString: string | undefined,
    focusedValueBoolean: boolean | undefined,
    focusedValueNumber: number | undefined,
    focusedValueColor: string | undefined
) {
    switch (focusPropType) {
        case "string":
            return focusedValueString

        case "boolean":
            return focusedValueBoolean

        case "number":
            return focusedValueNumber

        case "color":
            return focusedValueColor
    }
}

function getBlurredValue(
    focusPropType: "string" | "boolean" | "number" | "color",
    blurredValueString: string | undefined,
    blurredValueBoolean: boolean | undefined,
    blurredValueNumber: number | undefined,
    blurredValueColor: string | undefined
) {
    switch (focusPropType) {
        case "string":
            return blurredValueString

        case "boolean":
            return blurredValueBoolean

        case "number":
            return blurredValueNumber

        case "color":
            return blurredValueColor
    }
}

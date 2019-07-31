import * as React from "react"
import { useMemo, useRef, useContext } from "react"
import {
    Direction,
    Focusable as SunbeamFocusable,
    FocusableTreeNode,
    useSunbeam,
} from "react-sunbeam"
import { addPropertyControls, ControlType, Frame, RenderTarget } from "framer"
import { ScrollContext } from "./ScrollContext"
import { useOnFocus } from "./useOnFocus"

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
        hidden: ({ focusPropType }) => focusPropType !== "string",
    },
    focusedValueBoolean: {
        type: ControlType.Boolean,
        title: "Focused value",
        hidden: ({ focusPropType }) => focusPropType !== "boolean",
    },
    focusedValueNumber: {
        type: ControlType.Number,
        title: "Focused value",
        step: 0.01,
        hidden: ({ focusPropType }) => focusPropType !== "number",
    },
    focusedValueColor: {
        type: ControlType.Color,
        title: "Focused value",
        hidden: ({ focusPropType }) => focusPropType !== "color",
    },

    blurredValueString: {
        type: ControlType.String,
        title: "Blurred value",
        hidden: ({ focusPropType }) => focusPropType !== "string",
    },
    blurredValueBoolean: {
        type: ControlType.Boolean,
        title: "Blurred value",
        hidden: ({ focusPropType }) => focusPropType !== "boolean",
    },
    blurredValueNumber: {
        type: ControlType.Number,
        title: "Blurred value",
        step: 0.01,
        hidden: ({ focusPropType }) => focusPropType !== "number",
    },
    blurredValueColor: {
        type: ControlType.Color,
        title: "Blurred value",
        hidden: ({ focusPropType }) => focusPropType !== "color",
    },
})

interface FocusEvent {
    element: HTMLElement
    focusablePath: ReadonlyArray<string>
}

interface Props {
    width: number
    height: number
    children: JSX.Element
    tapToFocus?: boolean
    focusableKey?: string
    onFocus?: (event: FocusEvent) => void
    unstable_getPreferredChildOnFocusReceive?: (args: {
        focusableChildren: Map<string, FocusableTreeNode>
        focusOrigin?: FocusableTreeNode
        direction?: Direction
    }) => FocusableTreeNode | undefined

    focusProp: string
    focusPropType: "string" | "boolean" | "number" | "color"

    focusedValueString: string
    focusedValueBoolean: boolean
    focusedValueNumber: number
    focusedValueColor: string

    blurredValueString: string
    blurredValueBoolean: boolean
    blurredValueNumber: number
    blurredValueColor: string
}

export function Focusable(props: Props) {
    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <Frame
                size="100%"
                background="#F67280"
                color="white"
                style={{ fontSize: "100px" }}
            >
                F
            </Frame>
        )
    }

    if (RenderTarget.current() === RenderTarget.canvas) {
        return (
            <CanvasPresentation width={props.width} height={props.height}>
                {props.children}
            </CanvasPresentation>
        )
    }

    return <PreviewPresentation {...props} />
}

function CanvasPresentation(props: {
    width: number
    height: number
    children: JSX.Element
}) {
    const { width, height, children } = props

    return React.Children.count(children) > 0 ? (
        children
    ) : (
        <EmptyStatePlaceholder width={width} height={height}>
            Connect to frame or component
        </EmptyStatePlaceholder>
    )
}

function PreviewPresentation({
    width,
    height,
    children,
    focusableKey,
    onFocus,
    unstable_getPreferredChildOnFocusReceive,

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
    const { setFocus } = useSunbeam()
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
                    unstable_getPreferredChildOnFocusReceive
                }
            >
                {({ focused, path }) => (
                    <FocusableWrapper
                        width={width}
                        height={height}
                        focused={focused}
                        onClick={() => {
                            if (tapToFocus) setFocus(path as string[])
                        }}
                        onFocus={element => {
                            if (notifyScrollOnFocus)
                                notifyScrollOnFocus({
                                    boundingBox: element.getBoundingClientRect(),
                                })
                            if (onFocus)
                                onFocus({ element, focusablePath: path })
                        }}
                    >
                        {React.Children.map(children, child =>
                            React.cloneElement(child, {
                                [focusProp]: focused
                                    ? focusedValue
                                    : blurredValue,
                            })
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
    focused,
    onClick,
    onFocus,
    children,
}: {
    width: number
    height: number
    focused: boolean
    onClick?: () => void
    onFocus: (element: HTMLElement) => void
    children: React.ReactNode
}) {
    const elementRef = useRef(null)

    useOnFocus(focused, () => {
        onFocus(elementRef.current)
    })

    return (
        <div ref={elementRef} style={{ width, height }} onClick={onClick}>
            {children}
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
    focusedValueString: string,
    focusedValueBoolean: boolean,
    focusedValueNumber: number,
    focusedValueColor: string
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
    blurredValueString: string,
    blurredValueBoolean: boolean,
    blurredValueNumber: number,
    blurredValueColor: string
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

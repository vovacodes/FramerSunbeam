import * as React from "react"
import { useMemo, useEffect, useRef } from "react"
import { Focusable as SunbeamFocusable } from "react-sunbeam"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

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

interface Props {
    width: number
    height: number
    children: JSX.Element
    focusableKey?: string
    onFocus?: (focusablePath: ReadonlyArray<string>) => void

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

export function Focusable({
    width,
    height,
    children,
    focusableKey,
    onFocus,

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
}: Props) {
    const randomKey = useMemo(
        () => Math.floor(Math.random() * 100000).toString(),
        []
    )
    const focusKey = focusableKey || randomKey

    if (RenderTarget.current() === RenderTarget.canvas) {
        return <span>{children}</span>
    }

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
        <SunbeamFocusable focusKey={focusKey}>
            {({ focused, path }) => (
                <FocusableWrapper
                    width={width}
                    height={height}
                    focused={focused}
                    onFocus={() => {
                        if (onFocus) onFocus(path)
                    }}
                >
                    {React.Children.map(children, child =>
                        React.cloneElement(child, {
                            [focusProp]: focused ? focusedValue : blurredValue,
                        })
                    )}
                </FocusableWrapper>
            )}
        </SunbeamFocusable>
    )
}

addPropertyControls(Focusable, {
    children: { type: ControlType.ComponentInstance, title: "Child" },
    focusableKey: { type: ControlType.String, title: "Key" },
    focusProp: {
        type: ControlType.String,
        title: "Focus prop",
    },
    focusPropType: {
        type: ControlType.Enum,
        title: "Focus prop type",
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

function FocusableWrapper({
    width,
    height,
    focused,
    onFocus,
    children,
}: {
    width: number
    height: number
    focused: boolean
    onFocus: () => void
    children: React.ReactNode
}) {
    const prevFocused = usePrevious(focused, focused)

    useEffect(() => {
        if (prevFocused === focused) return

        if (focused && onFocus) {
            onFocus()
            return
        }
    }, [prevFocused, focused, onFocus])

    return <div style={{ width, height }}>{children}</div>
}

function usePrevious<T>(value: T, initialValue?: T): T {
    const ref = useRef<T>(initialValue)

    // Store current value in ref
    useEffect(() => {
        ref.current = value
    }, [value])

    // Return previous value (happens before update in useEffect above)
    return ref.current
}

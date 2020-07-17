import * as React from "react"
import { Frame, addPropertyControls, ControlType, RenderTarget } from "framer"
import { ScrollContext } from "./ScrollContext"
import { ReactElement } from "react"

addPropertyControls(Scroll, {
    children: {
        type: ControlType.ComponentInstance,
        title: "Content",
    },
    overflow: {
        type: ControlType.Boolean,
        title: "Overflow",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    direction: {
        type: ControlType.SegmentedEnum,
        title: "Direction",
        options: ["vertical", "horizontal", "both"],
        optionTitles: [
            <span style={{ fontSize: "30px" }}>↕</span>,
            "↔",
            // @ts-ignore
            <span
                // @ts-ignore
                dangerouslySetInnerHtml={{ __html: "&#x6F&#x332;" }}
                style={{ fontSize: "30px" }}
            />,
        ] as any,
        defaultValue: "both",
    },
    vertical_stickiness: {
        title: "↕ Stickiness",
        type: ControlType.Enum,
        options: ["auto", "top", "bottom"],
        optionTitles: ["Auto", "Top edge", "Bottom edge"],
        hidden(props: Props) {
            return props.direction === "horizontal"
        },
    },
    horizontal_stickiness: {
        title: "↔Stickiness",
        type: ControlType.Enum,
        options: ["auto", "left", "right"],
        optionTitles: ["Auto", "Left edge", "Right edge"],
        hidden(props: Props) {
            return props.direction === "vertical"
        },
    },
    background: {
        title: "Fill",
        type: ControlType.Color,
        defaultValue: "none",
    },

    // Transition props
    transitionType: {
        title: "Transition",
        type: ControlType.SegmentedEnum,
        defaultValue: "spring",
        options: ["spring", "tween"],
        optionTitles: ["Spring", "Tween"],
    },
    // spring
    damping: {
        title: "Damping",
        type: ControlType.Number,
        defaultValue: 40,
        min: 0,
        step: 10,
        displayStepper: true,
        hidden(props: Props) {
            return props.transitionType !== "spring"
        },
    },
    stiffness: {
        title: "Stiffness",
        type: ControlType.Number,
        defaultValue: 300,
        min: 0,
        step: 10,
        displayStepper: true,
        hidden(props: Props) {
            return props.transitionType !== "spring"
        },
    },
    // tween
    duration: {
        title: "Duration",
        type: ControlType.Number,
        defaultValue: 0.2,
        min: 0,
        step: 0.1,
        unit: "s",
        displayStepper: true,
        hidden(props: Props) {
            return props.transitionType !== "tween"
        },
    },
    easing: {
        title: "Easing",
        type: ControlType.Enum,
        defaultValue: "easeOut",
        options: [
            "linear",
            "easeIn",
            "easeOut",
            "easeInOut",
            "circIn",
            "circOut",
            "circInOut",
            "backIn",
            "backOut",
            "backInOut",
            "anticipate",
        ],
        optionTitles: [
            "linear",
            "easeIn",
            "easeOut",
            "easeInOut",
            "circIn",
            "circOut",
            "circInOut",
            "backIn",
            "backOut",
            "backInOut",
            "anticipate",
        ],
        hidden(props: Props) {
            return props.transitionType !== "tween"
        },
    },
})

interface Props {
    width: number
    height: number
    children: React.ReactElement
    overflow: boolean
    direction: "vertical" | "horizontal" | "both"
    vertical_stickiness: "auto" | "top" | "bottom"
    horizontal_stickiness: "auto" | "left" | "right"
    background: string
    transitionType: "spring" | "tween"
    // spring
    damping: number
    stiffness: number
    // tween
    duration: number
    easing:
        | "linear"
        | "easeIn"
        | "easeOut"
        | "easeInOut"
        | "circIn"
        | "circOut"
        | "circInOut"
        | "backIn"
        | "backOut"
        | "backInOut"
        | "anticipate"
}

export function Scroll(props: Props) {
    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <Frame
                size="100%"
                background="rgb(45, 42, 46)"
                color="rgb(120, 220, 232)"
                style={{ fontSize: "100px" }}
            >
                S
            </Frame>
        )
    }

    return <DefaultScroll {...props} />
}

function DefaultScroll({
    width,
    height,
    children,
    overflow,
    direction,
    vertical_stickiness,
    horizontal_stickiness,
    background,
    transitionType,
    damping,
    stiffness,
    duration,
    easing,
}: Props) {
    const viewportRef = React.useRef<HTMLDivElement>(null)
    const trackRef = React.useRef<HTMLDivElement>(null)
    const [scrollX, setScrollX] = React.useState(0)
    const [scrollY, setScrollY] = React.useState(0)

    const onChildFocus = React.useCallback(
        ({
            boundingBox: focusedElementBoundingBox,
        }: {
            boundingBox: ClientRect
        }) => {
            const track = trackRef.current
            const viewport = viewportRef.current
            if (!viewport || !track) return

            const {
                width: viewportWidth,
                height: viewportHeight,
                left: viewportLeft,
                top: viewportTop,
            } = viewport.getBoundingClientRect()
            const viewportOffsetWidth = viewport.offsetWidth
            const viewportOffsetHeight = viewport.offsetHeight

            const {
                left: trackLeft,
                top: trackTop,
            } = track.getBoundingClientRect()
            const trackScrollWidth = track.scrollWidth
            const trackScrollHeight = track.scrollHeight

            const scaleX = viewportWidth / viewport.offsetWidth
            const scaleY = viewportHeight / viewport.offsetHeight
            const currentScrollX = (viewportLeft - trackLeft) / scaleX
            const currentScrollY = (viewportTop - trackTop) / scaleY

            const {
                width: elementWidth,
                height: elementHeight,
                left: elementLeft,
                top: elementTop,
            } = focusedElementBoundingBox

            const elementOffsetLeft = elementLeft - viewportLeft
            const elementOffsetTop = elementTop - viewportTop
            const elementRightEdge = elementOffsetLeft + elementWidth
            const elementBottomEdge = elementOffsetTop + elementHeight

            let newScrollX = 0
            if (direction === "horizontal" || direction === "both") {
                let deltaScrollX = 0

                if (
                    horizontal_stickiness === "auto" ||
                    elementWidth <= viewportWidth
                ) {
                    if (elementLeft < viewportLeft) {
                        deltaScrollX = (elementLeft - viewportLeft) / scaleX
                    } else if (elementRightEdge > viewportWidth) {
                        deltaScrollX =
                            (elementRightEdge - viewportWidth) / scaleX
                    }
                } else {
                    // if there is not enough space for the whole element to fit within the viewport
                    if (horizontal_stickiness === "left") {
                        // and `horizontal_stickiness === "left"` align the element's
                        // left edge too the left of the viewport
                        deltaScrollX = (elementLeft - viewportLeft) / scaleX
                    } else if (horizontal_stickiness === "right") {
                        // and `horizontal_stickiness === "right"` align the element's
                        // right edge too the right of the viewport
                        deltaScrollX =
                            (elementRightEdge - viewportWidth) / scaleX
                    }
                }

                newScrollX = ensureScrollXWithinBounds(
                    currentScrollX + deltaScrollX
                )
                function ensureScrollXWithinBounds(value: number): number {
                    const minScrollX = 0
                    const maxScrollX = Math.max(
                        trackScrollWidth - viewportOffsetWidth,
                        0
                    )
                    if (value < minScrollX) return minScrollX
                    if (value > maxScrollX) return maxScrollX
                    return value
                }
            }

            let newScrollY = 0
            if (direction === "vertical" || direction === "both") {
                let deltaScrollY = 0

                if (
                    vertical_stickiness === "auto" ||
                    elementHeight <= viewportHeight
                ) {
                    if (elementTop < viewportTop) {
                        deltaScrollY = (elementTop - viewportTop) / scaleY
                    } else if (elementBottomEdge > viewportHeight) {
                        deltaScrollY =
                            (elementBottomEdge - viewportHeight) / scaleY
                    }
                } else {
                    // if there is not enough space for the whole element to fit within the viewport
                    if (vertical_stickiness === "top") {
                        // and `stickiness === "top"` align the element's
                        // top edge too the top of the viewport
                        deltaScrollY = (elementTop - viewportTop) / scaleY
                    } else if (vertical_stickiness === "bottom") {
                        // and `stickiness === "bottom"` align the element's
                        // bottom edge too the bottom of the viewport
                        deltaScrollY =
                            (elementBottomEdge - viewportHeight) / scaleY
                    }
                }

                newScrollY = ensureScrollYWithinBounds(
                    currentScrollY + deltaScrollY
                )

                function ensureScrollYWithinBounds(value: number): number {
                    const minScrollY = 0
                    const maxScrollY = Math.max(
                        trackScrollHeight - viewportOffsetHeight,
                        0
                    )
                    if (value < minScrollY) return minScrollY
                    if (value > maxScrollY) return maxScrollY
                    return value
                }
            }

            setScrollX(newScrollX)
            setScrollY(newScrollY)
        },
        []
    )
    const contextValue = React.useMemo(
        () => ({ notifyScrollOnFocus: onChildFocus }),
        [onChildFocus]
    )

    const child =
        children &&
        (React.Children.toArray(children)[0] as ReactElement | undefined)

    if (!child) {
        return <EmptyStatePlaceholder width={width} height={height} />
    }

    const transition =
        transitionType === "spring"
            ? { type: "spring", damping, stiffness }
            : { type: "tween", duration, ease: easing }

    const isPreview = RenderTarget.current() === RenderTarget.preview

    return (
        <ScrollContext.Provider value={contextValue}>
            <div
                ref={viewportRef}
                style={{
                    width,
                    height,
                    background,
                    overflow: overflow ? "visible" : "hidden",
                }}
            >
                <Frame
                    ref={trackRef}
                    position="relative"
                    background="none"
                    width={child && child.props.width}
                    height={child && child.props.height}
                    animate={{ x: -scrollX, y: -scrollY }}
                    transition={transition}
                    style={isPreview ? { willChange: "transform" } : undefined}
                >
                    {child}
                </Frame>
            </div>
        </ScrollContext.Provider>
    )
}

// FIXME: this is copy-paste from Focusable.tsx because we can't share
// components between files without making them appear in the Components UI in Framer
function EmptyStatePlaceholder({
    width,
    height,
}: {
    width: number
    height: number
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
                Connect to scrollable content
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

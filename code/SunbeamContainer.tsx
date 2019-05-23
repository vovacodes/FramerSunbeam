import * as React from "react"
import { useMemo, useCallback, useEffect } from "react"
import {
    FocusManager,
    SunbeamProvider,
    FocusableTreeNode,
    Direction,
} from "react-sunbeam"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

interface Props {
    children: JSX.Element
    height: number
    width: number
    upKey?: string
    downKey?: string
    leftKey?: string
    rightKey?: string
    unstable_getPreferredChildOnFocusReceive?: (args: {
        focusableChildren: Map<string, FocusableTreeNode>
        focusOrigin?: FocusableTreeNode
        direction?: Direction
    }) => FocusableTreeNode | undefined
}

export function SunbeamContainer({
    height,
    width,
    children,
    upKey = "ArrowUp",
    downKey = "ArrowDown",
    leftKey = "ArrowLeft",
    rightKey = "ArrowRight",
    unstable_getPreferredChildOnFocusReceive,
}: Props) {
    const focusManager = useMemo(
        () =>
            new FocusManager({
                initialFocusPath: [],
            }),
        []
    )

    const renderTarget = RenderTarget.current()

    const onKeyDown = useCallback(
        (event: Event) => {
            if (!(event instanceof KeyboardEvent)) return

            if (renderTarget !== RenderTarget.preview) return

            switch (event.key) {
                case rightKey:
                    event.preventDefault()
                    event.stopPropagation()
                    focusManager.moveRight()
                    return

                case leftKey:
                    event.preventDefault()
                    event.stopPropagation()
                    focusManager.moveLeft()
                    return

                case upKey:
                    event.preventDefault()
                    event.stopPropagation()
                    focusManager.moveUp()
                    return

                case downKey:
                    event.preventDefault()
                    event.stopPropagation()
                    focusManager.moveDown()
                    return
            }
        },
        [upKey, downKey, leftKey, rightKey]
    )

    useGlobalEventListener("keydown", onKeyDown)

    if (renderTarget === RenderTarget.canvas) {
        const content =
            React.Children.count(children) > 0 ? (
                children
            ) : (
                <EmptyStatePlaceholder width={width} height={height}>
                    Connect to frame
                </EmptyStatePlaceholder>
            )

        return <>{content}</>
    }

    return (
        <SunbeamProvider
            focusManager={focusManager}
            unstable_getPreferredChildOnFocusReceive={
                unstable_getPreferredChildOnFocusReceive
            }
        >
            {children}
        </SunbeamProvider>
    )
}

addPropertyControls(SunbeamContainer, {
    children: { type: ControlType.ComponentInstance, title: "child" },
    upKey: {
        type: ControlType.String,
        title: "Up key",
        defaultValue: "ArrowUp",
    },
    downKey: {
        type: ControlType.String,
        title: "Down key",
        defaultValue: "ArrowDown",
    },
    leftKey: {
        type: ControlType.String,
        title: "Left key",
        defaultValue: "ArrowLeft",
    },
    rightKey: {
        type: ControlType.String,
        title: "Right key",
        defaultValue: "ArrowRight",
    },
})

type EventListener = (evt: Event) => void
function useGlobalEventListener<E extends Event>(
    eventName: string,
    listener: EventListener
) {
    useEffect(() => {
        window.addEventListener(eventName, listener)

        return () => {
            window.removeEventListener(eventName, listener)
        }
    }, [eventName, listener])
}

// FIXME: this is copy-paste from Focusable.tsx because we can't share
// components between files without making them appear in the Components UI in Framer
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

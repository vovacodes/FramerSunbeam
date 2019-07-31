import * as React from "react"
import { useMemo, useCallback, useEffect } from "react"
import {
    FocusManager,
    SunbeamProvider,
    FocusableTreeNode,
    Direction,
} from "react-sunbeam"
import { addPropertyControls, ControlType, Frame, RenderTarget } from "framer"

addPropertyControls(SunbeamContainer, {
    children: { type: ControlType.ComponentInstance, title: "Content" },
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

interface Props {
    children: React.ReactNode
    height: number
    width: number
    upKey?: string
    downKey?: string
    leftKey?: string
    rightKey?: string
    onKeyPress?: (event: KeyboardEvent) => void
    onFocusUpdate?: (event: { focusPath: ReadonlyArray<string> }) => void
    unstable_getPreferredChildOnFocusReceive?: (args: {
        focusableChildren: Map<string, FocusableTreeNode>
        focusOrigin?: FocusableTreeNode
        direction?: Direction
    }) => FocusableTreeNode | undefined
}

export function SunbeamContainer(props: Props) {
    if (RenderTarget.current() === RenderTarget.thumbnail) {
        return (
            <Frame
                size="100%"
                background="#6C5B7B"
                color="white"
                style={{ fontSize: "100px" }}
            >
                C
            </Frame>
        )
    }

    if (RenderTarget.current() === RenderTarget.canvas) {
        const content =
            React.Children.count(props.children) > 0 ? (
                props.children
            ) : (
                <EmptyStatePlaceholder
                    width={props.width}
                    height={props.height}
                >
                    Connect to frame
                </EmptyStatePlaceholder>
            )

        return <>{content}</>
    }

    return <PreviewPresentation {...props} />
}

function PreviewPresentation({
    children,
    upKey = "ArrowUp",
    downKey = "ArrowDown",
    leftKey = "ArrowLeft",
    rightKey = "ArrowRight",
    onKeyPress,
    onFocusUpdate,
    unstable_getPreferredChildOnFocusReceive,
}: Props) {
    const focusManager = useMemo(
        () =>
            new FocusManager({
                initialFocusPath: [],
            }),
        []
    )

    const handleKeyDown = useCallback(
        (event: Event) => {
            if (!(event instanceof KeyboardEvent)) return

            if (onKeyPress) onKeyPress(event)

            switch (event.key) {
                case rightKey:
                    focusManager.moveRight()
                    return

                case leftKey:
                    focusManager.moveLeft()
                    return

                case upKey:
                    focusManager.moveUp()
                    return

                case downKey:
                    focusManager.moveDown()
                    return
            }
        },
        [upKey, downKey, leftKey, rightKey, onKeyPress]
    )

    useGlobalEventListener("keydown", handleKeyDown)

    return (
        <SunbeamProvider
            focusManager={focusManager}
            onFocusUpdate={onFocusUpdate}
            unstable_getPreferredChildOnFocusReceive={
                unstable_getPreferredChildOnFocusReceive
            }
        >
            {children}
        </SunbeamProvider>
    )
}

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

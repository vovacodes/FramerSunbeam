# Framer Sunbeam

Spatial navigation and focus management for TVs and gaming consoles done simple.

## Details

Provides two easy to use code components.

-   Drag them onto your canvas
-   Connect them to their content (`Frames` or any other code components)
-   Specify the child property to update on focus for every `Focusable`
-   Run the preview
-   Press arrow keys on your keyboard/gamepad/tv remote
-   Enjoy spatial navigation magic happen

## Components

### `SunbeamContainer`

Creates a focus management context.

Connect it to the `Frame` within which you want focus to be managed
You can only have one `SunbeamContainer` per artboard

### `Focusable`

Defines a component that can receive focus.

Connect it to a content component (`Frame` or any other code/design component).
Most of the time you want the size of the `Focusable` to match the size of its child content because when calculating the best candidate for receiving focus Sunbeam uses position and dimensions of the `Focusable`, not its content

You can nest `Focusable`s, in this case the best candidate for the focus is first attempted to be found within the same `Focusable` parent.
This is useful when creating sections of the UI, e.g. Side Menu where the `Focusable` items are not necessarily positioned to each other closer than to the items from the Main section

##### Props

| Display name    | React name                                                                                                                                        | Type                                                                | Required? | Default       | Description                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Key             | `focusableKey`                                                                                                                                    | string                                                              | yes       | random string | Identifier of a `Focusable`. Has to be unique among the `Focusable` siblings                                                                                                                                                                                                                                                                                                                                                     |
| Focus prop      | `focusProp`                                                                                                                                       | string                                                              | no        | -             | Name of the child prop that will be updated when `Focusable` receives/loses focus                                                                                                                                                                                                                                                                                                                                                |
| Focus prop type | `focusPropType`                                                                                                                                   | string, one of `"string"` or `"boolean"` or `"number"` or `"color"` | no        | -             | Type of `focusProp`                                                                                                                                                                                                                                                                                                                                                                                                              |
| Focused value   | Depends on the value of `focusPropType` prop. Either `focusedValueString` or `focusedValueBoolean` or `focusedValueNumber` or `focusedValueColor` | Depends on the value of `focusPropType` prop.                       | no        | -             | Value that is passed to the child's prop when the `Focusable` is focused                                                                                                                                                                                                                                                                                                                                                         |
| Blurred value   | Depends on the value of `focusPropType` prop. Either `blurredValueString` or `blurredValueBoolean` or `blurredValueNumber` or `blurredValueColor` | Depends on the value of `focusPropType` prop.                       | no        | -             | Value that is passed to the child's prop when the `Focusable` is blurred                                                                                                                                                                                                                                                                                                                                                         |
| -               | `onFocus`                                                                                                                                         | (focusablePath: string[]) => void                                   | no        | -             | Function that is called when the `Focusable` receives focus. Can be provided via [code overrides](https://framer.gitbook.io/framer/code/code-overrides). Receives `focusablePath` which is an array of `focusableKey`s of all `Focusable`s in the hierarchy from the root `Focusable` to the current one. Can be useful for saving the focus state or react to the focus updates, e.g. manual scrolling to the focused component |

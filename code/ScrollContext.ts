import { createContext } from "react"

export interface ScrollContextValue {
    notifyScrollOnFocus: ({ boundingBox: ClientRect }) => void
}

export const ScrollContext = createContext<ScrollContextValue | null>(null)

// Because of the limitation of Framer X we can't
// export singletons as a module from the package
// so exporting it as a global variable for now
window["SunbeamScrollContext"] = ScrollContext

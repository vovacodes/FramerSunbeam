import { createContext } from "react"

export const ScrollContext = createContext<{
    notifyScrollOnFocus: ({ boundingBox: ClientRect }) => void
} | null>(null)

// Because of the limitation of Framer X we can't
// export singletons as a module from the package
// so exporting it as a global variable for now
window["SunbeamScrollContext"] = ScrollContext

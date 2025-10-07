import React, {createContext, useContext, useEffect, useState} from "react";

const ThemeProviderContext = createContext(undefined);

export function ThemeProvider({children, defaultTheme = "dark", storageKey = "ui-theme"}) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(storageKey) || defaultTheme;
        }
        return defaultTheme;
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    const setTheme = (newTheme) => {
        localStorage.setItem(storageKey, newTheme);
        setThemeState(newTheme);
    };

    return <ThemeProviderContext.Provider value={{theme, setTheme}}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

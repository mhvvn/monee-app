"use client";

import React, { createContext, useContext, useState } from "react";

type MobileSidebarContextType = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

const MobileSidebarContext = createContext<MobileSidebarContextType | undefined>(undefined);

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <MobileSidebarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </MobileSidebarContext.Provider>
    );
}

export function useMobileSidebar() {
    const context = useContext(MobileSidebarContext);
    if (context === undefined) {
        throw new Error("useMobileSidebar must be used within a MobileSidebarProvider");
    }
    return context;
}

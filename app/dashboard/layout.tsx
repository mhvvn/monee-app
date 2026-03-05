import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { MobileSidebarProvider } from "@/components/MobileSidebarContext";
import { AutoLogoutTimer } from "@/components/AutoLogoutTimer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileSidebarProvider>
            <AutoLogoutTimer timeoutMinutes={15} />
            <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans overflow-hidden transition-colors duration-300">
                {/* Sidebar for Desktop & Mobile Overlay */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col md:ml-64 relative min-w-0 h-screen overflow-y-auto">
                    <Navbar />

                    <main className="flex-1 p-6 md:p-8 shrink-0">
                        {children}
                    </main>
                </div>
            </div>
        </MobileSidebarProvider>
    );
}

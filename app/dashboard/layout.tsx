import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { MobileSidebarProvider } from "@/components/MobileSidebarContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileSidebarProvider>
            <div className="flex min-h-screen bg-neutral-950 text-white font-sans overflow-hidden">
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

"use client"
import { Sidebar } from "@/app/dashboard/layout/sidebar"
import { useState } from "react"
import { Header } from "./layout/Header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [userRole] = useState('Admin') // Set default role, can be managed by auth system

    return (
        // <ProtectedRoute>
            <div className="flex h-screen bg-background">
                {/* Sidebar */}
                <Sidebar
                    isCollapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <Header userRole={userRole} />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>

                {/* Mobile Sidebar Overlay */}
                {!sidebarCollapsed && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        onClick={() => setSidebarCollapsed(true)}
                    />
                )}
            </div>
        // </ProtectedRoute>
    )
}

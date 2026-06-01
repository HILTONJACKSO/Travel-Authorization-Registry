'use client';

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GovNavbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const LayoutClient = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const isPublicPage = pathname === "/";

    useEffect(() => {
        if (!isLoading && !user && !isPublicPage) {
            router.push("/");
        }
    }, [isLoading, user, isPublicPage, router]);

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (isLoading) {
        return (
            <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="spinner-border text-dark" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (isPublicPage) {
        return <div className="vh-100 overflow-auto">{children}</div>;
    }

    if (!user) {
        return null; // Don't render protected layout if redirecting
    }

    return (
        <div className="vh-100 d-flex flex-column overflow-hidden position-relative">
            <GovNavbar onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="d-flex flex-grow-1 overflow-hidden">
                <div 
                    className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`} 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-grow-1 overflow-auto p-4 bg-light" style={{ minWidth: 0 }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

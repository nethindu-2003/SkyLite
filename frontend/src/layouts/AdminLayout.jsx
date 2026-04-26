import { Outlet } from 'react-router-dom';
import AdminNavbar from '../admin/AdminNavbar';
import AdminFooter from '../admin/AdminFooter';

export default function AdminLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0e0e0f]">
            {/* Standardized Admin Header */}
            <AdminNavbar />

            {/* Dynamic Content Area */}
            <main className="flex-grow pt-20 md:pt-28">
                <div className="max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* Standardized Admin Footer */}
            <AdminFooter />
        </div>
    );
}

import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-50 relative">
            <Sidebar mode="admin" />
            <div className="absolute top-0 right-0 left-0 bottom-16 md:left-24 md:bottom-0 h-auto md:h-full overflow-y-auto p-4 md:p-8 scrollbar-hide">
                <div className="max-w-7xl mx-auto pb-4 md:pb-0">
                    {children}
                </div>
            </div>
        </div>
    );
}

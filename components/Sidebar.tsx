'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  FileText,
  BarChart3,
  Upload,
  LogOut,
  Menu,
  X,
  DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface SidebarProps {
  userRole: 'owner' | 'admin' | 'invoice_biller';
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'admin'] },
    { href: '/customers', label: 'Customers', icon: Users, roles: ['owner', 'admin'] },
    { href: '/services', label: 'Services', icon: Wrench, roles: ['owner', 'admin'] },
    { href: '/stock', label: 'Stock', icon: Package, roles: ['owner', 'admin'] },
    { href: '/product-prices', label: 'Product Prices', icon: DollarSign, roles: ['owner', 'admin'] },
    { href: '/invoices', label: 'Invoices', icon: FileText, roles: ['owner', 'admin', 'invoice_biller'] },
    { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['owner', 'admin'] },
    { href: '/import', label: 'Import Excel', icon: Upload, roles: ['owner', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-900 text-white transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-8 mt-12 lg:mt-4">
            <h1 className="text-xl font-bold px-3">Service Center</h1>
          </div>
          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="mr-3" size={20} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <LogOut className="mr-3" size={20} />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}


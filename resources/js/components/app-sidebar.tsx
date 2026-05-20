import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from 'react-router-dom';
import { LayoutGrid, Users, Calendar, Briefcase, Clock, Zap, Settings } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Employees',
        url: '/employees',
        icon: Users,
    },
    {
        title: 'Leaves',
        url: '/leaves',
        icon: Calendar,
    },
    {
        title: 'Tasks',
        url: '/tasks',
        icon: Briefcase,
    },
    {
        title: 'Attendance',
        url: '/attendance',
        icon: Clock,
    },
    {
        title: 'Jobs',
        url: '/jobs',
        icon: Briefcase,
    },
    {
        title: 'Candidates',
        url: '/candidates',
        icon: Users,
    },
    {
        title: 'Automation',
        url: '/automation',
        icon: Zap,
    },
    {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    // Add any footer links if needed
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

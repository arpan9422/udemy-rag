import { Database, MessageSquare } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Scraping & Upload",
    url: "/",
    icon: Database,
  },
  {
    title: "Chatbot",
    url: "/chatbot",
    icon: MessageSquare,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();

  // Add a handler for new chat navigation
  const handleNewChat = () => {
    navigate("/chatbot?newchat=1");
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <div className="px-6 py-4">
          <h2 className={`font-bold text-lg transition-smooth ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            Udemy RAG
          </h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 transition-smooth ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Add New Chat button under Chatbot */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleNewChat}
                  className="flex items-center gap-3 transition-smooth hover:bg-muted"
                >
                  <span className="h-5 w-5 flex items-center justify-center rounded-full bg-primary text-white">+</span>
                  {!isCollapsed && <span>New Chat</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

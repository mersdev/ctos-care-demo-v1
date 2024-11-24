import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import logo from "../../assets/logo.png";

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: "Report", path: "/", icon: DocumentTextIcon },
    { name: "Tasks", path: "/tasks", icon: ClipboardDocumentListIcon },
    { name: "Chat", path: "/chat", icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-0 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Brand Name */}
          <div className="flex-shrink-0 flex items-center">
            <img className="h-8" src={logo} alt="CTOS Logo" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              CTOS Care
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex">
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`-ml-0.5 mr-2 h-5 w-5 ${
                        isActive(item.path) ? "text-blue-700" : "text-gray-400"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

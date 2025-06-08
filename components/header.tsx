"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Download,
  LogOut,
  RefreshCcw as Loader,
} from "lucide-react";
import { logout } from "@/actions/auth";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.location.search = `?refresh=${Date.now()}`;
          }}
        >
          <Loader className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.location.href = "/admin/pos")}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          POS Mode
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => (window.location.href = "/admin/orders")}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          View Orders
        </Button>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}
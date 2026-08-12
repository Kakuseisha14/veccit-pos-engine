"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "../users/UserAvatar";
import { ChangePasswordModal } from "../account/ChangePasswordModal";
import { TenantProfileModal } from "../account/TenantProfileModal";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  TENANT_ADMIN: "Administrador",
  CASHIER: "Cajero",
};

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isTenantUser = user?.role === "TENANT_ADMIN";

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
        >
          <span className="mr-3 flex items-center justify-center overflow-hidden rounded-full h-11 w-11">
            <UserAvatar
              name={user?.name ?? "?"}
              avatarUrl={user?.avatarUrl ?? null}
              className="h-11 w-11"
            />
          </span>

          <span className="block mr-1 font-medium text-theme-sm">
            {user?.name?.split(" ")[0] ?? "Usuario"}
          </span>

          <svg
            className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            width="18"
            height="20"
            viewBox="0 0 18 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Dropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
        >
          <div>
            <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
              {user?.name ?? "Usuario"}
            </span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
              {user?.email ?? ""}
            </span>
            {user?.role && (
              <span className="mt-2 inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-theme-xs font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            )}
          </div>

          <ul className="flex flex-col gap-1 pt-4 pb-3 mt-3 border-t border-gray-200 dark:border-gray-800">
            {isTenantUser && (
              <li>
                <DropdownItem
                  onItemClick={() => {
                    closeDropdown();
                    setProfileOpen(true);
                  }}
                  tag="button"
                  className="flex w-full items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  Mi comercio
                </DropdownItem>
              </li>
            )}
            <li>
              <DropdownItem
                onItemClick={() => {
                  closeDropdown();
                  setPasswordOpen(true);
                }}
                tag="button"
                className="flex w-full items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Cambiar contrasena
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                onItemClick={() => {
                  closeDropdown();
                  void logout();
                }}
                tag="button"
                className="flex w-full items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Cerrar sesion
              </DropdownItem>
            </li>
          </ul>
        </Dropdown>
      </div>

      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
      <TenantProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "@/context/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  TENANT_ADMIN: "Administrador",
  CASHIER: "Cajero",
};

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 flex items-center justify-center overflow-hidden rounded-full h-11 w-11 bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
          <span className="font-semibold text-theme-sm">{initials}</span>
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
          <li>
            <DropdownItem
              onItemClick={() => {
                closeDropdown();
                void logout();
              }}
              tag="button"
              className="flex w-full items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 17.8631 9.44863 17.3882 9.15583 17.0952L5.81116 13.7484L16.0007 13.7484C16.4149 13.7484 16.7507 13.4127 16.7507 12.9984C16.7507 12.5842 16.4149 12.2484 16.0007 12.2484L5.81528 12.2484L9.15585 8.90554C9.44864 8.61255 9.44847 8.13767 9.15547 7.84488C8.86248 7.55209 8.3876 7.55226 8.09481 7.84525L3.52309 12.4202C3.35673 12.5577 3.25073 12.7657 3.25073 12.9984Z"
                  fill=""
                />
              </svg>
              Cerrar sesión
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}

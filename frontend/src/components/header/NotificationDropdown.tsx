"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "@/context/AuthContext";
import { listLowStock, type Product } from "@/lib/inventory";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const isAdmin = user?.role === "TENANT_ADMIN";

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await listLowStock();
        if (!cancelled) setProducts(res.products);
      } catch {
        if (!cancelled) setProducts([]);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  function toggleDropdown() {
    setIsOpen((prev) => {
      if (!prev) void loadLowStockRefresh();
      return !prev;
    });
  }

  async function loadLowStockRefresh() {
    if (!isAdmin) return;
    try {
      const res = await listLowStock();
      setProducts(res.products);
    } catch {
      setProducts([]);
    }
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const hasNotifications = products.length > 0;

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
        aria-label="Notificaciones"
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !hasNotifications ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notificaciones
          </h5>
          <button
            onClick={closeDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Cerrar"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {!isAdmin ? (
            <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Las notificaciones estan disponibles para el administrador.
            </li>
          ) : products.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No hay productos con stock bajo.
            </li>
          ) : (
            products.map((product) => (
              <li key={product.id}>
                <DropdownItem
                  onItemClick={closeDropdown}
                  href="/products"
                  tag="a"
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10 bg-error-50 dark:bg-error-500/10">
                    <svg
                      className="absolute inset-0 m-auto text-error-500"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.99957 2.75H18.0007C18.6261 2.75 19.2261 3.00045 19.6749 3.44917C20.1236 3.89793 20.3751 4.4979 20.3751 5.12331V5.5L21.3751 8.5V8.62531C21.3931 9.68477 20.8978 10.6811 20.0463 11.2911L19.9377 11.3684C19.2068 11.8873 18.312 12.0864 17.4377 11.9186V19.25H19.2507C19.6649 19.25 20.0007 19.5858 20.0007 20C20.0007 20.4142 19.6649 20.75 19.2507 20.75H4.7507C4.33649 20.75 4.0007 20.4142 4.0007 20C4.0007 19.5858 4.33649 19.25 4.7507 19.25H6.0007V11.9186C5.12237 12.0872 4.22348 11.8879 3.48856 11.3684L3.4376 11.3312C2.58697 10.7204 2.09252 9.72379 2.11214 8.66598"/>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.30273 8.61523H15.4463C16.0072 8.61523 16.5058 8.98451 16.6808 9.52123C16.8523 10.0467 17.3434 10.3906 17.8896 10.3906H19.4922C20.0466 10.3906 20.4922 10.8362 20.4922 11.3906C20.4922 11.945 20.0466 12.3906 19.4922 12.3906H4.30273C3.74835 12.3906 3.30273 11.945 3.30273 11.3906C3.30273 10.8362 3.74835 10.3906 4.30273 10.3906H5.03027L5 6.65039L4.94727 9.39062C4.92637 10.1659 4.88428 10.3906 4.30273 10.3906Z"
                      />
                    </svg>
                  </span>

                  <span className="block">
                    <span className="mb-1.5 block space-x-1 text-theme-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {product.name}
                      </span>
                      <span>ha alcanzado el stock minimo</span>
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>Quedan {product.stock} unidades</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>
                        Minimo:{" "}
                        <span className="font-medium text-error-500">
                          {product.minStock}
                        </span>
                      </span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
        {isAdmin && products.length > 0 && (
          <Link
            href="/products"
            onClick={closeDropdown}
            className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Ir al inventario
          </Link>
        )}
      </Dropdown>
    </div>
  );
}
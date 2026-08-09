"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import React, { useState } from "react";

export default function SignUpForm() {
  const { registerTenant } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const [tenantAdminName, setTenantAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerTenant({
        tenantName,
        tenantAdminName,
        email,
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Volver al inicio
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Registra tu Comercio
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Crea tu comercio y accede al panel de control.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>
                  Nombre del Comercio<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Mi Tienda C.A."
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label>
                  Nombre del Administrador
                  <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Nombre y apellido"
                  value={tenantAdminName}
                  onChange={(e) => setTenantAdminName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label>
                  Correo<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="admin@tucomercio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label>
                  Contrasena<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Minimo 8 caracteres"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-error-500">
                  {error}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Registrando..." : "Registrar Comercio"}
                </button>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Ya tienes una cuenta?
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Iniciar Sesion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
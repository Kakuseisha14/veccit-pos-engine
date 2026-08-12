import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veccit ERP | Iniciar Sesión",
  description: "Ingresa a tu panel de administración de Veccit ERP",
};

export default function SignIn() {
  return <SignInForm />;
}

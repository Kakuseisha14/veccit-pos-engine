import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veccit POS | Iniciar Sesión",
  description: "Ingresa a tu panel de administración de Veccit POS Engine",
};

export default function SignIn() {
  return <SignInForm />;
}

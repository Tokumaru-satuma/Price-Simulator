import { LoginScreen } from "@/features/auth/components/login-screen";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return <LoginScreen nextPath={next} />;
}

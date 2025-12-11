import { StaffLoginForm } from "@/components/auth/staff-login-form"

export default function AdminLogin() {
  return <StaffLoginForm roleLabel="Admin" redirectPath="/admin/dashboard" />
}

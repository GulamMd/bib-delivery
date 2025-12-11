import { StaffLoginForm } from "@/components/auth/staff-login-form"

// app/organizer/login/page.tsx
export default function OrganizerLogin() {
  return <StaffLoginForm roleLabel="Organizer" redirectPath="/organizer/dashboard" />
}

import { StaffLoginForm } from "@/components/auth/staff-login-form"

export default function DeliveryLogin() {
  return <StaffLoginForm roleLabel="Delivery Partner" redirectPath="/delivery/dashboard" />
}

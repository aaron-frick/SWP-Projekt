// Kein Guard hier – der Guard sitzt in app/admin/page.tsx,
// damit /admin/login keinen Redirect-Loop bekommt.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

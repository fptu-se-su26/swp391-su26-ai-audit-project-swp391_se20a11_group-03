import AdminShell from "@/components/shells/AdminShell";
import UsersClient from "@/app/admin/users/UsersClient";

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <UsersClient />
    </AdminShell>
  );
}

import AdminShell from "@/components/shells/AdminShell";
import CategoriesClient from "@/app/admin/categories/CategoriesClient";

export default function AdminCategoriesPage() {
  return (
    <AdminShell>
      <CategoriesClient />
    </AdminShell>
  );
}

import CollectorShell from "@/components/shells/CollectorShell";
import PostItemForm from "@/app/post-item/PostItemForm";

type PostItemPageProps = {
  searchParams: Promise<{ edit?: string | string[] }>;
};

export default async function PostItemPage({ searchParams }: PostItemPageProps) {
  const params = await searchParams;
  const rawEditId = Array.isArray(params.edit) ? params.edit[0] : params.edit;
  const parsedEditId = rawEditId ? Number(rawEditId) : undefined;
  const editProductId =
    parsedEditId !== undefined && Number.isInteger(parsedEditId) && parsedEditId > 0
      ? parsedEditId
      : undefined;

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">
          {editProductId ? "Chỉnh sửa vật phẩm" : "Đăng vật phẩm"}
        </h1>
        <div className="mt-8">
          <PostItemForm editProductId={editProductId} />
        </div>
      </div>
    </CollectorShell>
  );
}

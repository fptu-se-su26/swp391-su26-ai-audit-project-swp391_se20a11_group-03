import CollectorShell from "@/components/shells/CollectorShell";
import PostItemForm from "@/app/post-item/PostItemForm";

export default function PostItemPage() {
  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Đăng vật phẩm</h1>
        <div className="mt-8">
          <PostItemForm />
        </div>
      </div>
    </CollectorShell>
  );
}

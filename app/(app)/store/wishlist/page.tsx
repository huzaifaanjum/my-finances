import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import WishlistView from "@/components/store/WishlistView";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <PageShell
      title="Wishlist"
      back={{ href: "/store", label: "Store" }}
      subtitle="What you saved from the Store, and what buying all of it costs once your spending account and vision cover pay their share."
    >
      <WishlistView />
    </PageShell>
  );
}

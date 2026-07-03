import { UserChat } from "@/components/user-chat";

export default function LiveChatPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-display font-light text-ink mb-6">
        Live Chat
      </h1>
      <UserChat />
    </div>
  );
}

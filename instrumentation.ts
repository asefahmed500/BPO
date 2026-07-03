export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initEventHandlers } = await import("@/lib/events/handlers");
    initEventHandlers();
  }
}

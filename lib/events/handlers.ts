import { eventBus } from "./emitter";
import { createNotification } from "@/lib/services/notification.service";
import { logAudit } from "@/lib/services/audit.service";
import { queue } from "@/lib/queue";

// Register all event → notification + audit mappings
let initialized = false;

export function initEventHandlers() {
  if (initialized) return;
  initialized = true;

  // --- Requirement events ---
  eventBus.on("requirement.submitted", (e) => {
    // Notify all admins/support
    queue.add(
      "notify-admins",
      {
        type: "requirement.submitted",
        title: "New requirement submitted",
        message: e.data.userName
          ? `${e.data.userName} submitted "${e.data.title}"`
          : `New requirement: "${e.data.title}"`,
        link: "/admin/requirements",
        excludeUserId: e.actorId,
      },
      { priority: "high" }
    );
    logAudit({
      actorId: e.actorId,
      action: "requirement.submitted",
      resource: "requirement",
      resourceId: e.data.requirementId,
      details: e.data,
    });
  });

  eventBus.on("requirement.approved", (e) => {
    if (e.data.userId) {
      createNotification({
        userId: e.data.userId,
        type: "requirement.approved",
        title: "Requirement approved",
        message: `Your requirement "${e.data.title}" has been approved.`,
        link: "/dashboard/requirements",
      });
    }
    logAudit({
      actorId: e.actorId,
      action: "requirement.approved",
      resource: "requirement",
      resourceId: e.data.requirementId,
      details: e.data,
    });
  });

  eventBus.on("requirement.rejected", (e) => {
    if (e.data.userId) {
      createNotification({
        userId: e.data.userId,
        type: "requirement.rejected",
        title: "Requirement rejected",
        message: `Your requirement "${e.data.title}" was rejected. ${
          e.data.adminNotes || ""
        }`,
        link: "/dashboard/requirements",
      });
    }
    logAudit({
      actorId: e.actorId,
      action: "requirement.rejected",
      resource: "requirement",
      resourceId: e.data.requirementId,
      details: e.data,
    });
  });

  // --- Meeting events ---
  eventBus.on("meeting.scheduled", (e) => {
    if (e.data.participantId) {
      createNotification({
        userId: e.data.participantId,
        type: "meeting.scheduled",
        title: "Meeting scheduled",
        message: `"${e.data.title}" scheduled for ${new Date(
          e.data.scheduledAt
        ).toLocaleString()}`,
        link: "/dashboard/meetings",
      });
    }
    logAudit({
      actorId: e.actorId,
      action: "meeting.scheduled",
      resource: "meeting",
      resourceId: e.data.meetingId,
      details: e.data,
    });
  });

  eventBus.on("meeting.completed", (e) => {
    if (e.data.participantId) {
      createNotification({
        userId: e.data.participantId,
        type: "meeting.completed",
        title: "Meeting completed",
        message: `"${e.data.title}" marked as completed.`,
        link: "/dashboard/meetings",
      });
    }
    logAudit({
      actorId: e.actorId,
      action: "meeting.completed",
      resource: "meeting",
      resourceId: e.data.meetingId,
      details: e.data,
    });
  });

  eventBus.on("meeting.cancelled", (e) => {
    if (e.data.participantId) {
      createNotification({
        userId: e.data.participantId,
        type: "meeting.cancelled",
        title: "Meeting cancelled",
        message: `"${e.data.title}" has been cancelled.`,
        link: "/dashboard/meetings",
      });
    }
    logAudit({
      actorId: e.actorId,
      action: "meeting.cancelled",
      resource: "meeting",
      resourceId: e.data.meetingId,
      details: e.data,
    });
  });

  // --- Message events ---
  eventBus.on("message.sent", (e) => {
    if (e.data.recipientId) {
      createNotification({
        userId: e.data.recipientId,
        type: "message.sent",
        title: "New message",
        message: e.data.content
          ? `${e.data.senderName || "Someone"}: ${e.data.content.slice(0, 60)}`
          : "You have a new message",
        link: e.data.role === "support"
          ? "/support/messages"
          : "/dashboard/messages",
      });
    }
  });

  // --- Project events ---
  eventBus.on("project.submitted", (e) => {
    logAudit({
      actorId: e.actorId,
      action: "project.submitted",
      resource: "project",
      resourceId: e.data.projectId,
      details: e.data,
    });
  });

  eventBus.on("project.approved", (e) => {
    createNotification({
      userId: e.data.userId,
      type: "project.approved",
      title: "Project approved",
      message: `Your project "${e.data.name}" has been approved.`,
      link: "/dashboard/projects",
    });
    logAudit({
      actorId: e.actorId,
      action: "project.approved",
      resource: "project",
      resourceId: e.data.projectId,
      details: e.data,
    });
  });

  eventBus.on("project.rejected", (e) => {
    createNotification({
      userId: e.data.userId,
      type: "project.rejected",
      title: "Project rejected",
      message: `Your project "${e.data.name}" was rejected. ${e.data.feedback || ""}`.trim(),
      link: "/dashboard/projects",
    });
    logAudit({
      actorId: e.actorId,
      action: "project.rejected",
      resource: "project",
      resourceId: e.data.projectId,
      details: e.data,
    });
  });

  eventBus.on("project.feedback", (e) => {
    createNotification({
      userId: e.data.userId,
      type: "project.feedback",
      title: "Project feedback received",
      message: `Feedback on "${e.data.name}": ${e.data.feedback || "Please review and revise."}`,
      link: "/dashboard/projects",
    });
    logAudit({
      actorId: e.actorId,
      action: "project.feedback",
      resource: "project",
      resourceId: e.data.projectId,
      details: e.data,
    });
  });

  eventBus.on("project.created", (e) => {
    if (e.data.userId) {
      createNotification({
        userId: e.data.userId,
        type: "project.created",
        title: "New project assigned",
        message: `Project "${e.data.name}" has been created for you.`,
        link: "/dashboard/projects",
      });
    }
    logAudit({
      actorId: e.actorId,
      action: "project.created",
      resource: "project",
      resourceId: e.data.projectId,
      details: e.data,
    });
  });

  eventBus.on("project.completed", (e) => {
    if (e.data.userId) {
      createNotification({
        userId: e.data.userId,
        type: "project.completed",
        title: "Project completed",
        message: `Project "${e.data.name}" is now marked as completed.`,
        link: "/dashboard/projects",
      });
    }
    logAudit({
      actorId: e.actorId,
      action: "project.completed",
      resource: "project",
      resourceId: e.data.projectId,
      details: e.data,
    });
  });

  // --- User events ---
  eventBus.on("user.role_changed", (e) => {
    if (e.data.userId) {
      createNotification({
        userId: e.data.userId,
        type: "user.role_changed",
        title: "Your role has been updated",
        message: `Your role is now: ${e.data.newRole}`,
        link: "/dashboard",
      });
    }
    logAudit({
      actorId: e.actorId,
      action: "user.role_changed",
      resource: "user",
      resourceId: e.data.userId,
      details: e.data,
    });
  });

  eventBus.on("user.blocked", (e) => {
    logAudit({
      actorId: e.actorId,
      action: "user.blocked",
      resource: "user",
      resourceId: e.data.userId,
      details: e.data,
    });
  });

  eventBus.on("user.unblocked", (e) => {
    logAudit({
      actorId: e.actorId,
      action: "user.unblocked",
      resource: "user",
      resourceId: e.data.userId,
      details: e.data,
    });
  });

  // --- Goal events ---
  eventBus.on("goal.completed", (e) => {
    logAudit({
      actorId: e.actorId,
      action: "goal.completed",
      resource: "goal",
      resourceId: e.data.goalId,
      details: e.data,
    });
  });

  // --- Task events ---
  eventBus.on("task.assigned", (e) => {
    if (e.data.assigneeId) {
      createNotification({
        userId: e.data.assigneeId,
        type: "task.assigned",
        title: "New task assigned",
        message: `Task "${e.data.title}" has been assigned to you.`,
        link: "/dashboard/projects",
      });
    }
  });

  // --- Queue handler for notify-admins ---
  queue.register("notify-admins", async (data: any) => {
    const { connectDB } = await import("@/lib/mongoose");
    const User = (await import("@/models/User")).default;
    await connectDB();

    const admins = await User.find({ role: "admin" }).select("_id").lean();
    const support = await User.find({ role: "support" }).select("_id").lean();

    const recipients = [...admins, ...support]
      .map((u) => u._id.toString())
      .filter((id) => id !== data.excludeUserId);

    for (const userId of recipients) {
      await createNotification({
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      });
    }
  });
}

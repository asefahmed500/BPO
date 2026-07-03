"use client";

import { useState, useEffect, use } from "react";
import {
  getProject,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "@/lib/actions/project-actions";
import Link from "next/link";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const load = async () => {
    try {
      setProject(await getProject(id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({ projectId: id, title, description, priority, taskType: "task", estimatedHours: 0, tags: [] });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setPriority("medium");
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await updateTaskStatus(taskId, status as any);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted text-sm">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-sm">Project not found</p>
        <Link
          href="/dashboard/projects"
          className="text-sm text-ink underline underline-offset-2"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    low: "bg-gray-50 text-gray-600",
    medium: "bg-yellow-50 text-yellow-700",
    high: "bg-red-50 text-red-700",
  };

  const statusOptions = ["todo", "in-progress", "done"];

  return (
    <div>
      <Link
        href="/dashboard/projects"
        className="text-xs text-muted hover:text-ink transition-colors mb-6 inline-block"
      >
        &larr; Back to projects
      </Link>

      <div className="bg-white rounded-2xl border border-hairline p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-xl font-display font-light text-ink">{project.name}</h1>
        </div>
        <p className="text-sm text-muted">{project.description}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-display font-light text-ink">
          Tasks ({project.tasks?.length || 0})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
        >
          {showForm ? "Cancel" : "Add Task"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white rounded-2xl border border-hairline p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-body-strong mb-1">Task title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-body-strong mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
          >
            Create Task
          </button>
        </form>
      )}

      {(!project.tasks || project.tasks.length === 0) ? (
        <div className="text-center py-12 text-muted text-sm">No tasks yet</div>
      ) : (
        <div className="space-y-2">
          {project.tasks.map((task: any) => (
            <div
              key={task._id}
              className="bg-white rounded-2xl border border-hairline p-4 flex items-start gap-4"
            >
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                className="text-xs border border-hairline rounded-lg px-2 py-1 bg-white text-ink focus:outline-none focus:border-ink"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      priorityColors[task.priority] || "bg-gray-50"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`text-sm ${
                      task.status === "done"
                        ? "line-through text-muted"
                        : "text-ink"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-muted mt-1">{task.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

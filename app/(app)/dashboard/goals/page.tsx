"use client";

import { useState, useEffect } from "react";
import { getGoals, createGoal, updateGoalProgress, deleteGoal } from "@/lib/actions/goal-actions";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");

  const loadGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGoal({
        title,
        description: "",
        category: "performance",
        priority: "medium",
        targetValue: Number(targetValue),
        currentValue: 0,
        unit: unit || "units",
        tags: [],
        milestones: [],
      });
      setShowForm(false);
      setTitle("");
      setTargetValue("");
      setUnit("");
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleProgress = async (goalId: string, current: number) => {
    try {
      await updateGoalProgress({ goalId, currentValue: current + 1 });
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-muted text-sm">Track your KPIs and targets</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
        >
          {showForm ? "Cancel" : "New Goal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-hairline p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm text-body-strong mb-1">Goal title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
              placeholder="e.g. Monthly sales target"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-body-strong mb-1">Target value</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-sm text-body-strong mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-xl text-sm text-ink focus:outline-none focus:border-ink"
                placeholder="units, $, %"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
          >
            Create Goal
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted text-sm">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-sm mb-4">No goals yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors"
          >
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal: any) => {
            const progress = Math.min(
              Math.round((goal.currentValue / goal.targetValue) * 100),
              100
            );
            return (
              <div
                key={goal._id}
                className="bg-white rounded-2xl border border-hairline p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-display font-light text-ink">
                      {goal.title}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      goal.status === "completed"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>
                <div className="w-full bg-canvas rounded-full h-2 mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleProgress(goal._id, goal.currentValue)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-canvas text-body hover:text-ink transition-colors"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleDelete(goal._id)}
                    className="text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

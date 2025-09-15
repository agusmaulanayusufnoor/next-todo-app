"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Modal from "@/components/Modal";
import TaskForm from "@/components/TaskForm";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { AuthButton } from "@/components/auth-button";

export default function DashboardPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [hasMore, setHasMore] = useState(true);

  const fetchTodos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (!error) {
      setTodos(data || []);
      setHasMore((data || []).length === pageSize);
    } else {
      console.error("Error fetching todos:", error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, [page]);

  const handleDelete = async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
    fetchTodos();
  };

  return (

     
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">My To-Do List</h1>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setEditingTodo(null);
                setShowModal(true);
              }}
            >
              Create Task
            </button>
          </div>

          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">Task</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : todos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                todos.map((todo) => (
                  <tr key={todo.id} className="border-t">
                    <td className="p-2">
                      {new Date(todo.created_at).toLocaleString()}
                    </td>
                    <td className="p-2">{todo.task}</td>
                    <td className="p-2">{todo.is_complete ? "✅" : "❌"}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="text-blue-600"
                        onClick={() => {
                          setEditingTodo(todo);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600"
                        onClick={() => handleDelete(todo.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-between mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {showModal && (
            <Modal onClose={() => setShowModal(false)}>
              <TaskForm
                todo={editingTodo}
                onSuccess={() => {
                  setShowModal(false);
                  fetchTodos();
                }}
              />
            </Modal>
          )}
        </div>

  );
}

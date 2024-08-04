//src/api/todo.js

import { apiClient } from "./client";

export const getTodoApi = async () => {
  return apiClient.get("/posts");
};

export const createTodoApi = async (todo) => {
  return apiClient.post("/posts", { todo });
};

export const updateTodoApi = async (id, todo, isCompleted) => {
  return apiClient.put(`/posts/${id}`, { todo, isCompleted });
};

export const deleteTodoApi = async (id) => {
  return apiClient.delete(`/posts/${id}`);
};
import { useState, useEffect } from "react";

export function useTodos(initialTodos = []) {
  const [todosList, setTodosList] = useState(initialTodos);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [todosPaged, setTodosPaged] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [todosPerPage] = useState(9);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTodosList(initialTodos);
  }, [initialTodos]);

  useEffect(() => {
    const todosToDisplay = isSearching ? searchResults : todosList;
    
    const indexOfLastTodo = currentPage * todosPerPage;
    const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
    setTodosPaged(todosToDisplay.slice(indexOfFirstTodo, indexOfLastTodo));
  }, [todosList, searchResults, isSearching, currentPage, todosPerPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    const todosToDisplay = isSearching ? searchResults : todosList;
    const totalPages = Math.ceil(todosToDisplay.length / todosPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const searchTodos = async (query) => {
    if (!query || query.trim() === "") {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LAMBDA_API_ENDPOINT}/todos/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search TODOs");
      }

      const results = await response.json();
      
      if (results.length === 0) {
        console.log("No API results, searching local todos...");
        const localResults = todosList.filter(todo => 
          todo.task.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(localResults);
      } else {
        setSearchResults(results);
      }
      
      setCurrentPage(1);
      return results;
    } catch (error) {
      console.error("Error searching TODOs:", error);
      
      console.log("API search failed, searching local todos...");
      const localResults = todosList.filter(todo => 
        todo.task.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(localResults);
      
      return localResults;
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
    setCurrentPage(1);
  };

  const updateTodoStatus = async (id, task, completed) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LAMBDA_API_ENDPOINT}/todos/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task, completed }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update TODO");
      }

      const updatedTodo = await response.json();

      setTodosList((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: updatedTodo.completed } : todo
        )
      );
    } catch (error) {
      console.error("Error updating TODO:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (task) => {
    setLoading(true);
    try {
      console.log("Creating todo with task:", task);
      console.log("API endpoint:", process.env.NEXT_PUBLIC_LAMBDA_API_ENDPOINT);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LAMBDA_API_ENDPOINT}/todos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task, completed: false }),
        }
      );

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to create TODO: ${response.status} ${errorText}`);
      }

      const newTodo = await response.json();
      console.log("New todo created:", newTodo);
      
      setTodosList(prevTodos => [...prevTodos, newTodo]);
      
      const totalPages = Math.ceil((todosList.length + 1) / todosPerPage);
      if (currentPage === Math.ceil(todosList.length / todosPerPage) || totalPages === 1) {
      } else {
        setCurrentPage(totalPages);
      }
      
      return newTodo;
    } catch (error) {
      console.error("Error creating TODO:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LAMBDA_API_ENDPOINT}/todos/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete TODO");
      }

      setTodosList((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      const remainingTodos = todosList.filter(todo => todo.id !== id).length;
      const newTotalPages = Math.ceil(remainingTodos / todosPerPage);
      if (currentPage > newTotalPages && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
    } catch (error) {
      console.error("Error deleting TODO:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    todosList,
    todosPaged,
    currentPage,
    loading,
    searchQuery,
    setSearchQuery,
    searchTodos,
    clearSearch,
    isSearching,
    totalPages: Math.ceil((isSearching ? searchResults.length : todosList.length) / todosPerPage),
    handlePrevious,
    handleNext,
    updateTodoStatus,
    createTodo,
    deleteTodo,
  };
}
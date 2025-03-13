import { styled } from "@mui/material/styles"
import {
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Container,
  Button,
  Box,
  Paper,
  Grid2 as Grid,
  TextField,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { useState } from "react"
import { useTodos } from "../hooks/useTodos"

export default function TodosPage({ todos, error }) {
  const [newTodoText, setNewTodoText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const {
    todosPaged,
    currentPage,
    loading,
    totalPages,
    handlePrevious,
    handleNext,
    updateTodoStatus,
    createTodo,
    deleteTodo,
    searchQuery,
    setSearchQuery,
    searchTodos,
    clearSearch,
    isSearching,
  } = useTodos(todos);

  if (error) {
    return <div>Error fetching TODOs: {error.message}</div>
  }

  const handleCheckboxChange = (id, task, completed) => {
    updateTodoStatus(id, task, !completed)
  }

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewTodoText("");
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    console.log("Form submitted with text:", newTodoText);
    
    if (!newTodoText.trim()) {
      console.log("Empty todo text, not submitting");
      return;
    }
    
    try {
      console.log("Calling createTodo...");
      const result = await createTodo(newTodoText);
      console.log("Todo created successfully:", result);
      setNewTodoText("");
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create todo:", error);
      alert("Failed to create todo: " + error.message);
    }
  };

  const handleDeleteClick = (todo) => {
    setTodoToDelete(todo);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!todoToDelete) return;
    
    try {
      await deleteTodo(todoToDelete.id);
      setDeleteConfirmOpen(false);
      setTodoToDelete(null);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      alert("Failed to delete todo: " + error.message);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTodoToDelete(null);
  };

  const ThemedCheckbox = styled(Checkbox)(({ theme }) => {
    return {
      color: theme.status?.active?.main,
      "&:hover": {
        color: theme.status?.active?.dark,
      },
      "&.Mui-checked": {
        color: theme.status?.active?.main,
      },
    }
  })

  const ThemedButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.status?.active?.main,
    "&:hover": {
      backgroundColor: theme.status?.active?.dark,
    },
  }))

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          TODOs List
        </Typography>
        <ThemedButton 
          variant="contained" 
          onClick={handleOpenModal}
          disabled={loading}
        >
          Add New Todo
        </ThemedButton>
      </Box>

      <Box mb={3} display="flex" alignItems="center" gap={1}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchTodos(searchQuery);
            }
          }}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <Box component="span" mr={1}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </Box>
            ),
          }}
        />
        <ThemedButton
          variant="contained"
          onClick={() => searchTodos(searchQuery)}
          disabled={loading}
        >
          Search
        </ThemedButton>
        {isSearching && (
          <Button
            variant="outlined"
            onClick={clearSearch}
            disabled={loading}
          >
            Clear
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {todosPaged.map((todo, index) => (
          <Grid key={index} size={{ xs: 6, md: 4, xl: 3 }}>
            <Paper>
              <img
                src={todo.image}
                alt={`Image for ${todo.task}`}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <ListItem>
                <ThemedCheckbox
                  checked={todo.completed}
                  onChange={() =>
                    handleCheckboxChange(todo.id, todo.task, todo.completed)
                  }
                  disabled={loading}
                />
                <ListItemText
                  primary={todo.task}
                  secondary={todo.completed ? "Completed" : "Pending"}
                />
                <Button 
                  color="error" 
                  onClick={() => handleDeleteClick(todo)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </ListItem>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box mt={2}>
        <ThemedButton
          onClick={handlePrevious}
          variant="contained"
          disabled={currentPage === 1}
        >
          Previous
        </ThemedButton>
        <Typography variant="body1" component="span" mx={2}>
          Page {currentPage} of {totalPages}
        </Typography>

        <ThemedButton
          onClick={handleNext}
          variant="contained"
          disabled={currentPage === totalPages}
        >
          Next
        </ThemedButton>
      </Box>

      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Add New Todo</DialogTitle>
        <form onSubmit={handleCreateTodo}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Todo Description"
              fullWidth
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              disabled={loading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} disabled={loading}>
              Cancel
            </Button>
            <ThemedButton 
              type="submit" 
              variant="contained" 
              disabled={loading || !newTodoText.trim()}
            >
              Add
            </ThemedButton>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{todoToDelete?.task}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export async function getServerSideProps(context) {
  try {
    const res = await fetch(`${process.env.LAMBDA_API_ENDPOINT}/todos`)

    if (!res.ok) {
      throw new Error("Failed to fetch TODOs")
    }

    const todos = await res.json()

    return {
      props: {
        todos: todos,
      },
    }
  } catch (error) {
    return {
      props: {
        todos: [],
        error: { message: error.message },
      },
    }
  }
}

import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/TodoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest' 
import { TodoUpdate } from '../models/TodoUpdate'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]>{
    return await todoAccess.getTodos(userId)
}

export async function createTodoItem(
    createTodoItem: CreateTodoRequest,
    userId: string
): Promise<TodoItem>{

    const todoId = uuid.v4()
    return await todoAccess.createTodo({

        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: createTodoItem.name,
        dueDate: createTodoItem.dueDate,
        done: false
    })
}
export async function deleteTodo(userId: string, todoId: string): Promise<String> {
    return todoAccess.deleteTodo(userId, todoId)

}
export async function getUploadUrl(userId: string, todoId: string): Promise<String>{
    return todoAccess.getUploadUrl(userId, todoId)
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodo: UpdateTodoRequest
): Promise<TodoUpdate>{
    const updatedTodo: TodoUpdate ={
        name: updateTodo.name,
        dueDate: updateTodo.dueDate,
        done: updateTodo.done

    }
    return await todoAccess.updateTodo(userId, todoId, updatedTodo)
}



import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
const logger = createLogger('todos')

// TODO: Implement businessLogic
//Call all the to do access functions
const ToDoAccess = new TodosAccess()

export async function getTodos(uId: string): Promise<TodoItem[]>{
    console.log("Getting all todo")
    return ToDoAccess.getTodos(uId)
}

export async function generateUploadUrl(todoId: string): Promise<string>
{
    console.log("Generating URL")
    logger.info('User uploaded data to todo item: ', {todoId})
    return ToDoAccess.generateUploadUrl(todoId)
}

export async function createTodo(createtodorequest: CreateTodoRequest, uId: string): Promise<TodoItem>{
    const tId = uuid.v4()
    logger.info("todoId", tId)
    return await ToDoAccess.createTodo({
        uId,tId,createdAt: new Date().getTime().toString(),name: createtodorequest.name,dueDate: createtodorequest.dueDate,done: false,
    })
}

export async function updateTodo(updatetodorequest: UpdateTodoRequest, uId: string, tId: string) {

    return await ToDoAccess.updateTodo(updatetodorequest, uId, tId);
}

export async function deleteTodo(uId: string, tId: string){
    return await ToDoAccess.deleteTodo(uId, tId)
}
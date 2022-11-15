import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { Types } from 'aws-sdk/clients/s3';

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    private readonly document_client: DocumentClient
    private readonly todo_table: any
    private readonly index_name: any
    private readonly bucket_name: any
    private readonly bucket_client: Types
    constructor
    (
        document_client = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'}),
        todo_table = process.env.TODOS_TABLE,
        index_name = process.env.TODOS_CREATED_AT_INDEX,
        bucket_name = process.env.S3_BUCKET_NAME,
        bucket_client = new AWS.S3({signatureVersion: 'v4'}),
    ){
       this.document_client = document_client
       this.todo_table = todo_table
       this.index_name = index_name
       this.bucket_name = bucket_name
       this.bucket_client = bucket_client
    }

    // getting all todos
    async getTodos(userId: string): Promise<TodoItem[]> {
        console.log("Getting all todo")
        const userdeclaration = "#userId = :userId";
        const username = "userId";
        const params = { 
            Todo_Table: this.todo_table,
            IndexName: this.index_name,
            Declaration: userdeclaration, 
            Name: { "#userId": username },
            UserId: { ":userId": userId }
        };
        const result = await this.document_client.query(params).promise();
        logger.info('User accessed todo items', {result})
        const items = result.Items
        return items as TodoItem[]
      }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      console.log("Creating new todo");  
      const params = { 
        todo_Table: this.todo_table, 
        Item: todoItem,
    };
    const result = await this.document_client.put(params).promise();
    logger.info('User created a todo', {result})
    return todoItem as TodoItem
    }

    async updateTodo(todo: TodoUpdate, todoId: string, userId: string) {
      console.log("Updating todo")
      logger.info(`Updating a todo`, {
          todoId: todoId,
          userId: userId
        });
        const Update_Expression = "SET #todo_name = :name, dueDate = :dueDate, done = :done"
        const params = {
          TableName: this.todo_table,
          Key: {userId: userId, todoId: todoId},
          ExpressionAttributeNames: {'#todo_name': 'name',},
          ExpressionAttributeValues: {
            ":name": todo.name,
            ":dueDate": todo.dueDate,
            ":done": todo.done,
          },
          UpdateExpression: Update_Expression,
          ReturnValues: "ALL_NEW",
        }
    
        const result = await this.document_client.update(params).promise();
        logger.info('Update statement has completed without error', { result: result });
    
        return result.Attributes as TodoItem
      }
    
    
    async deleteTodo(userId: string, todoId: string) {
      console.log("Deleting todo");  
      const params = {
            TableName: this.todo_table,
            Key: {
              todoId, 
              userId
            }
          }
          const result = await this.document_client.delete(params).promise();
          logger.info('User deleted a todo item', {result})
          return "" as string 
        
    }

    async generateUploadUrl(todoId: string): Promise<string>{
      console.log("Generating URL")
      const url = this.bucket_client.getSignedUrl('putObject',{ Bucket: this.bucket_name, Key: todoId, Expires: 1000, })
      logger.info('User uploaded data to todo item: ', {todoId})
      return url as string
  }
}


import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
//import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants'
const AWSXRay = require('aws-xray-sdk');
//const XAWS = AWSXRay.captureAWS(AWS)


const logger = createLogger('createTodo')

const s3 = new AWSXRay.S3({
    signatureVersion: 'v4'
})

const urlExpireation = process.env.SIGNED_URL_EXPIRATION

export class TodoAccess{

    constructor(
        private readonly docClient: DocumentClient = new AWSXRay.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        ){
        }

    async getTodos(userId: string): Promise<TodoItem[]> {
        console.log('Getting all TODO items for a user')
    
        //const todosIndex = process.env.IndexName
        //IndexName: todosIndex,

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId' :  userId
            }

        }).promise()
        logger.info("Todos retrieved successfully")

        const items = result.Items
        return items as TodoItem[]

    }
   
    async createTodo(todo: TodoItem): Promise<TodoItem>{
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }
    
    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate>{
        var params = {
        TableName : this.todosTable,
        Key: {
            userId: userId, 
            todoId : todoId
        },
        UpdateExpression: "set name =:n, dueDate =:u, done:d",
        ExpressionAttributeValues:{
            ":n": todoUpdate.name,
            ":u": todoUpdate.dueDate,
            ":d": todoUpdate.done
        },
        ReturnValues: "UPDATED_NEW"
        };
        await this.docClient.update(params).promise
        return todoUpdate   
    }
    
    async deleteTodo(userId: string,todoId: string): Promise<String>{
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
        logger.info("Todo Item is deleted successfully")
        return ''
    }

    async getUploadUrl(userId: string, todoId: string): Promise<String>{
        const url = getUrl(todoId, this.bucketName)
        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        
        const options = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set attachmentUrl = :r",
            ExpressionAttributeValues: {
                ":r": attachmentUrl
            },
            ReturnValues: "UPDATED_NEW"
        };

        await this.docClient.update(options).promise()
        logger.info("Signed Url created ", url)
        return url;
    }    
}
function getUrl(todoId: string, bucketName: string ): string {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpireation)
    })
}
import 'source-map-support/register'
import { getUploadUrl } from '../../businessLogic/Todo'
import { getUserId } from '../utils'


import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const url = await getUploadUrl(userId, todoId)

  return {
    statusCode : 202,
    headers:{
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
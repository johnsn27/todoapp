import {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyHandler,
} from 'aws-lambda'
import { TodoItem } from '../interfaces/todo-item'
import { dynamoDb } from '../lib/dynamodb'
import { UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb'

const tableName = process.env.TABLE_NAME

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      throw new Error('Request body is undefined or null')
    }

    const data = JSON.parse(event.body) as Omit<TodoItem, 'id'>
    const { id } = event.pathParameters as APIGatewayProxyEventPathParameters

    if (!id) {
      throw new Error("Path parameter 'id' is missing")
    }

    const params: UpdateCommandInput = {
      TableName: tableName as string,
      Key: { id },
      UpdateExpression: 'set task = :task, completed = :completed',
      ExpressionAttributeValues: {
        ':task': data.task,
        ':completed': data.completed,
      },
      ReturnValues: 'ALL_NEW',
    }

    const result = await dynamoDb.send(new UpdateCommand(params))

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    }
  } catch (error) {
    console.error('Error updating to-do item:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Could not update to-do item',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        requestId: event.requestContext.requestId,
      }),
    }
  }
}

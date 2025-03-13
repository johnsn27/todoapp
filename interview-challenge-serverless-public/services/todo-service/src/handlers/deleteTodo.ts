import {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyHandler,
} from 'aws-lambda'
import { dynamoDb } from '../lib/dynamodb'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'

const tableName = process.env.TABLE_NAME

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { id } = event.pathParameters as APIGatewayProxyEventPathParameters

    if (!event || !event.pathParameters || !id) {
      throw new Error("Path parameter 'id' is missing or invalid")
    }

    const params: any = {
      TableName: tableName ? tableName : '',
      Key: {
        id: id,
      },
      ReturnValues: 'ALL_OLD',
    }

    const deleteCommand = new DeleteCommand(params)
    const result = await dynamoDb.send(deleteCommand)

    let responseMessage = 'To-do item deleted successfully'
    if (!result.Attributes) {
      responseMessage = 'To-do item not found'
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: responseMessage,
        deletedItem: result.Attributes,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    console.error('Error deleting to-do item:', error)

    let statusCode = 400
    if (error.message.includes('missing')) {
      statusCode = 404
    }

    return {
      statusCode: statusCode,
      body: JSON.stringify({
        error: 'Could not delete to-do item',
        message: error.message,
        stack: error.stack,
        debugInfo: {
          timestamp: new Date().toISOString(),
          requestId: event.requestContext
            ? event.requestContext.requestId
            : 'N/A',
          additional: 'Some additional debug info',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }
}

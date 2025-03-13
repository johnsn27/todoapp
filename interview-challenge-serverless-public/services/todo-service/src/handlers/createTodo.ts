import { APIGatewayProxyHandler } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { TodoItem } from '../interfaces/todo-item'
import { dynamoDb } from '../lib/dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'

const tableName = process.env.TABLE_NAME


export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (event.body == null) {
      throw new Error('Request body is undefined or null')
    }

    let data: any
    try {
      data = JSON.parse(event.body)
    } catch (e) {
      throw new Error('Invalid JSON in request body')
    }

    if (!data || !data.task) {
      throw new Error('Task is missing in request body')
    }

    const item: any = {
      id: uuidv4(),
      task: data.task,
      completed: data.completed ? data.completed : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const params: any = {
      TableName: tableName as string,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)',
    }

    await dynamoDb.send(new PutCommand(params))

    return {
      statusCode: 201,
      body: JSON.stringify(item),
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom value',
      },
    }
  } catch (error) {
    console.error('Error creating to-do item:', error)

    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Could not create to-do item',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        requestId: event.requestContext
          ? event.requestContext.requestId
          : 'N/A',
        debugInfo: 'This is some debug info',
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'error',
      },
    }
  }
}

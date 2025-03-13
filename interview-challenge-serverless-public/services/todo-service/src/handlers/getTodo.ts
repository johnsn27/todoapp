import {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyHandler,
} from "aws-lambda"
import { dynamoDb } from "../lib/dynamodb"
import { ScanCommand } from "@aws-sdk/client-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"

const tableName = process.env.TABLE_NAME

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { id } = event.pathParameters as APIGatewayProxyEventPathParameters
    console.log(id)
    const params = {
      TableName: tableName as string,
      FilterExpression: "#id = :id",
      ExpressionAttributeNames: {
        "#id": "id",
      },
      ExpressionAttributeValues: {
        ":id": { S: id as string },
      },
    }

    const result = await dynamoDb.send(new ScanCommand(params))
    console.log(result)
    return {
      statusCode: 200,
      body:
        result && result.Items
          ? JSON.stringify(unmarshall(result.Items[0]))
          : JSON.stringify({ error: "Item not found" }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve to-do item" }),
    }
  }
}

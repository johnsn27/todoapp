import {
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyHandler,
} from "aws-lambda"
import { dynamoDb } from "../lib/dynamodb"
import { ScanCommand } from "@aws-sdk/client-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"

const tableName = process.env.TABLE_NAME

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const queryParams =
      event.queryStringParameters as APIGatewayProxyEventQueryStringParameters

    const pageNumber = queryParams?.page ? Number(queryParams.page) : 1
    const limitNumber = queryParams?.limit ? Number(queryParams.limit) : 10

    const params = {
      TableName: tableName as string,
    }

    const result = await dynamoDb.send(new ScanCommand(params))

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items?.map((item) => unmarshall(item))),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    }
  }
}

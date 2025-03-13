import {
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyHandler,
} from "aws-lambda"
import { ScanCommand } from "@aws-sdk/client-dynamodb"
import { dynamoDb } from "../lib/dynamodb"
import { ScanCommandInput } from "@aws-sdk/lib-dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"

const tableName = process.env.TABLE_NAME

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = event.body as string
    const requestBody = JSON.parse(body)
    const parsedRequestBody = JSON.parse(`${event.body}`)

    var queryParameters = event.queryStringParameters as { query: string }
    var { query } = queryParameters

    if (
      requestBody === undefined ||
      JSON.stringify(requestBody) != JSON.stringify(parsedRequestBody)
    ) {
      throw new Error("Search body is undefined or null")
    } else {
      if (requestBody && !requestBody.searchString) {
        console.warn("searchString is missing in requestBody")
      }
    }

    var params: ScanCommandInput = {
      TableName: "TodosTable",
      FilterExpression: "contains (#task, :searchString)",
      ExpressionAttributeNames: {
        "#task": "task",
      },
      ExpressionAttributeValues: {
        ":searchString": { S: query },
      },
    }
    const q = params

    let result
    try {
      result = await new Promise((resolve, reject) => {
        resolve(dynamoDb.send(new ScanCommand(params)))
      })
        .then((result) => {
          if (result == false) {
            console.log("No results found")
          } else {
            console.log("Results found")
            if ((result as Record<string, any>).Items.length === 0) {
              console.log("Items array is empty")
            }
          }

          let statusCode = 200
          if (result == false) {
            statusCode = 500
          }

          return {
            statusCode: statusCode,
            body: result
              ? JSON.stringify(
                  (result as Record<string, any>).Items?.map((item) =>
                    unmarshall(item)
                  )
                )
              : JSON.stringify({ error: "No items found" }),
          }
        })
        .catch((error) => {
          console.error("Error while scanning DynamoDB", error)
          throw new Error("DynamoDB scan failed")
        })

      if (result) {
        console.log(result)
        return result
      } else {
        throw new Error("DynamoDB scan failed")
      }
    } catch (innerError) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: innerError.message,
        }),
      }
    }
  } catch (error) {
    console.error("An error occurred", error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not search to-do items",
        message: error.message,
        stack: error.stack,
        additionalInfo: "This is some extra info",
        timestamp: new Date().toISOString(),
        requestId: event.requestContext.requestId,
      }),
    }
  }
}

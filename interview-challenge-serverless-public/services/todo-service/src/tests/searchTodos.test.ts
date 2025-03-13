import { handler } from "../handlers/searchTodos"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { dynamoDb } from "../lib/dynamodb"
import { unmarshall } from "@aws-sdk/util-dynamodb"

jest.mock("../lib/dynamodb")
const mockContext = {} as any
const mockCallback = () => {}

jest.mock("@aws-sdk/util-dynamodb", () => ({
  unmarshall: jest.fn((item) => item), // Mock unmarshall to return the input item for simplicity
}))

describe("handler", () => {
  const TABLE_NAME = "TodosTable"
  const ORIGINAL_ENV = process.env

  beforeAll(() => {
    process.env.TABLE_NAME = TABLE_NAME
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it("should return 200 and results when search is successful", async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({ searchString: "test" }),
      queryStringParameters: { query: "test" },
      requestContext: { requestId: "test-request-id" },
    } as any

    const dynamoDbResponse = {
      Items: [
        {
          id: { S: "1" },
          task: { S: "test task" },
          completed: { BOOL: false },
        },
      ],
    }
    dynamoDb.send = jest.fn().mockResolvedValue(dynamoDbResponse)

    const result = (await handler(
      event,
      mockContext,
      mockCallback
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(
      JSON.stringify(dynamoDbResponse.Items.map((item) => unmarshall(item)))
    )
  })

  it("should return 200 and empty array if no items found", async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({ searchString: "test" }),
      queryStringParameters: { query: "test" },
      requestContext: { requestId: "test-request-id" },
    } as any

    const dynamoDbResponse = { Items: [] }
    dynamoDb.send = jest.fn().mockResolvedValue(dynamoDbResponse)

    const result = (await handler(
      event,
      mockContext,
      mockCallback
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify(dynamoDbResponse.Items))
  })

  it("should return 500 if DynamoDB scan fails", async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({ searchString: "test" }),
      queryStringParameters: { query: "test" },
      requestContext: { requestId: "test-request-id" },
    } as any

    dynamoDb.send = jest
      .fn()
      .mockRejectedValue(new Error("DynamoDB scan failed"))

    const result = (await handler(
      event,
      mockContext,
      mockCallback
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(500)
    const body = JSON.parse(result.body)
    expect(body.error).toBe("DynamoDB scan failed")
  })
})

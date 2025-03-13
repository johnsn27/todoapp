import { handler } from "../handlers/createTodo"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { dynamoDb } from "../lib/dynamodb"

jest.mock("../lib/dynamodb")
const mockContext = {} as any

describe("handler", () => {
  it("should create a to-do item successfully", async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({ task: "Test task" }),
      requestContext: { requestId: "test-request-id" },
    } as any

    dynamoDb.send = jest.fn().mockResolvedValue({})

    const result = (await handler(
      event as any,
      mockContext,
      () => {}
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(201)
  })

  it("should return 400 if request body is missing", async () => {
    const event: APIGatewayProxyEvent = {
      body: null,
      requestContext: { requestId: "test-request-id" },
    } as any

    const result = (await handler(
      event as any,
      mockContext,
      () => {}
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(400)
  })

  it("should return 400 if JSON is invalid", async () => {
    const event: APIGatewayProxyEvent = {
      body: "{invalidJson}",
      requestContext: { requestId: "test-request-id" },
    } as any

    const result = (await handler(
      event as any,
      mockContext,
      () => {}
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(400)
  })

  it("should return 400 if task is missing in the request body", async () => {
    const event: APIGatewayProxyEvent = {
      body: JSON.stringify({}),
      requestContext: { requestId: "test-request-id" },
    } as any

    const result = (await handler(
      event as any,
      mockContext,
      () => {}
    )) as APIGatewayProxyResult

    expect(result.statusCode).toBe(400)
  })
})

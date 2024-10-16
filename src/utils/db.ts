import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = import.meta.env.VITE_DYNAMODB_TABLE_NAME;

export async function saveStory(story: string, videoUrl: string) {
  const id = uuidv4();
  const timestamp = Date.now();
  const params = {
    TableName: TABLE_NAME,
    Item: {
      id,
      timestamp,
      story,
      videoUrl,
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    return id;
  } catch (error) {
    console.error("Error saving story to DynamoDB:", error);
    throw error;
  }
}

export async function getStory(id: string) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id,
    },
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));
    return Item;
  } catch (error) {
    console.error("Error getting story from DynamoDB:", error);
    throw error;
  }
}

export async function getAllStories() {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    return Items;
  } catch (error) {
    console.error("Error getting all stories from DynamoDB:", error);
    throw error;
  }
}
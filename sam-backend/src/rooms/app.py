import json
import os

import boto3


def lambda_handler(event, context):
    # Get table name from environment variable or use default
    table_name = os.environ.get("ROOMS_TABLE", "Rooms")
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    # Scan the table to get all rooms
    response = table.scan()
    items = response.get("Items", [])

    # Transform items to match expected output
    rooms = [
        {
            "name": item.get("name"),
            "color": item.get("color"),
        }
        for item in items
    ]

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(rooms),
    }

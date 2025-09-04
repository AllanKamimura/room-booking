import json
import os

import boto3


def lambda_handler(event, context):
    # Get table name from environment variable or use default
    table_name = os.environ.get("BOOKINGS_TABLE", "Bookings")
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    # Scan the table to get all bookings
    response = table.scan()
    items = response.get("Items", [])

    # Optionally, transform items if needed to match the expected output
    bookings = [
        {
            "room": item.get("room"),
            "start": item.get("start"),
            "end": item.get("end"),
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
        "body": json.dumps(bookings),
    }

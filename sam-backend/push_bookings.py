#!/bin/python3
import ast
import re

import boto3

# Change this if your table name is different
TABLE_NAME = "Bookings"

booking_str = """
bookings = [\n  { "room": "Dorothy Vaughan", "start": "08:30", "end": "09:00" },\n  { "room": "John Von Neumann", "start": "08:30", "end": "09:00" },\n  { "room": "Dorothy Vaughan", "start": "09:00", "end": "10:00" },\n  { "room": "John Von Neumann", "start": "09:00", "end": "10:00" },\n  { "room": "Ayrton Senna", "start": "14:00", "end": "17:00" }\n]"""

# Extract the actual list string and evaluate safely
match = re.search(r"bookings\s*=\s*(\[[\s\S]*\]);?", booking_str)
if not match:
    raise ValueError("Could not extract bookings list")

bookings = ast.literal_eval(match.group(1))


def clear_table(table):
    print("Clearing all items from the table...")
    scan = table.scan(
        ProjectionExpression="room, #s", ExpressionAttributeNames={"#s": "start"}
    )
    with table.batch_writer() as batch:
        for item in scan["Items"]:
            batch.delete_item(Key={"room": item["room"], "start": item["start"]})
    print("Table cleared.")


def main():
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(TABLE_NAME)

    clear_table(table)

    for booking in bookings:
        print(f"Inserting: {booking}")
        table.put_item(Item=booking)

    print("All bookings inserted.")


if __name__ == "__main__":
    main()

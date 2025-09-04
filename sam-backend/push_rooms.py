import boto3

# Change this if your table name is different
TABLE_NAME = "Rooms"

# The room data to insert
rooms = [
    {"name": "Ayrton Senna", "color": "#d97706"},  # warm orange-brown
    {"name": "Santos Dumont", "color": "#7e57c2"},  # dusty violet
    {"name": "Alan Turing", "color": "#2b6cb0"},  # calm blue
    {"name": "Dorothy Vaughan", "color": "#c0841a"},  # golden amber
    {"name": "Ada Lovelace", "color": "#2f9e74"},  # muted teal
    {"name": "John Von Neumann", "color": "#b23a76"},  # deep rose
]


def clear_table(table):
    print("Clearing all items from the table...")
    scan = table.scan(
        ProjectionExpression="#n", ExpressionAttributeNames={"#n": "name"}
    )
    with table.batch_writer() as batch:
        for item in scan["Items"]:
            batch.delete_item(Key={"name": item["name"]})
    print("Table cleared.")


def main():
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(TABLE_NAME)

    clear_table(table)

    for room in rooms:
        print(f"Inserting: {room}")
        table.put_item(Item=room)

    print("All rooms inserted.")


if __name__ == "__main__":
    main()

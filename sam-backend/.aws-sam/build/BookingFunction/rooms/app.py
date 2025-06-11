import json


def lambda_handler(event, context):
    rooms = [
        {"name": "Ada Lovelace", "color": "#2f9e74"},  # muted teal
        {"name": "John von Neumann", "color": "#b23a76"},  # deep rose
        {"name": "Alan Turing", "color": "#2b6cb0"},  # calm blue
        {"name": "Dorothy Vaughan", "color": "#c0841a"},  # golden amber
        {"name": "Santos Dumont", "color": "#7e57c2"},  # dusty violet
        {"name": "Ayrton Senna", "color": "#d97706"},  # warm orange-brown
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

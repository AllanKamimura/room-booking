import json


def lambda_handler(event, context):
    rooms = [
        {"name": "Ada Lovelace", "color": "#10b981"},
        {"name": "John Neuman", "color": "#a21caf"},
        {"name": "Alan Turing", "color": "#03b1fc"},
        {"name": "Dorothy Vaughan", "color": "#fc03b6"},
        {"name": "Santos Dumont", "color": "#ef4444"},
        {"name": "Ayrton Senna", "color": "#428508"},
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

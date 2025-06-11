import json


def lambda_handler(event, context):
    bookings = [
        {"room": "Ada Lovelace", "start": "08:00", "end": "08:30"},
        {"room": "Santos Dumont", "start": "08:30", "end": "09:00"},
        {"room": "John Neuman", "start": "09:00", "end": "09:30"},
        {"room": "Ada Lovelace", "start": "09:30", "end": "10:00"},
        {"room": "Alan Turing", "start": "10:00", "end": "11:00"},
        {"room": "Ayrton Senna", "start": "11:00", "end": "11:30"},
        {"room": "Ada Lovelace", "start": "11:30", "end": "12:00"},
        {"room": "Alan Turing", "start": "12:00", "end": "13:00"},
        {"room": "Ayrton Senna", "start": "12:30", "end": "13:00"},
        {"room": "Dorothy Vaughan", "start": "13:00", "end": "13:30"},
        {"room": "Santos Dumont", "start": "13:30", "end": "14:00"},
        {"room": "John Neuman", "start": "14:00", "end": "14:30"},
        {"room": "Ada Lovelace", "start": "14:00", "end": "14:30"},
        {"room": "Alan Turing", "start": "14:30", "end": "15:00"},
        {"room": "Ayrton Senna", "start": "14:30", "end": "15:00"},
        {"room": "Dorothy Vaughan", "start": "15:00", "end": "15:30"},
        {"room": "Santos Dumont", "start": "15:30", "end": "16:00"},
        {"room": "John Neuman", "start": "16:00", "end": "16:30"},
        {"room": "Ada Lovelace", "start": "16:30", "end": "17:00"},
        {"room": "Alan Turing", "start": "17:00", "end": "17:30"},
        {"room": "Ayrton Senna", "start": "17:30", "end": "18:00"},
        {"room": "Dorothy Vaughan", "start": "18:00", "end": "18:30"},
        {"room": "Santos Dumont", "start": "18:00", "end": "18:30"},
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

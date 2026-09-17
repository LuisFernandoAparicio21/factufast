import json

def ok(body: dict) -> dict:
    return _build(200, body)

def bad_request(message: str) -> dict:
    return _build(400, {"error": message})

def server_error(message: str) -> dict:
    return _build(500, {"error": message})

def _build(status: int, body: dict) -> dict:
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body, ensure_ascii=False),
    }

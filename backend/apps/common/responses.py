from rest_framework.response import Response


def success_response(
    message="success",
    data=None,
    status_code=200,
):
    return Response(
        {
            "success": True,
            "message": message,
            "data": data,
            "errors": None,
        },
        status=status_code,
    )


def error_response(
    message="error",
    errors=None,
    status_code=400,
):
    return Response(
        {
            "success": False,
            "message": message,
            "data": None,
            "errors": errors,
        },
        status=status_code,
    )

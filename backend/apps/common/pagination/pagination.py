from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 1000
    message = ""

    def get_paginated_response(self, data, message=None):
        response_message = self.message if message is None else message

        return Response(
            {
                "success": True,
                "message": response_message,
                "data": {
                    "items": data,
                    "pagination": {
                        "count": self.page.paginator.count,
                        "next": self.get_next_link(),
                        "previous": self.get_previous_link(),
                        "page": self.page.number,
                        "page_size": self.get_page_size(self.request),
                    },
                },
                "errors": None,
            }
        )

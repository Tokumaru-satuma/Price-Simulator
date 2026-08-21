class BaseRule:
    """
    Validation Rule Base

    戻り値:
        {
            "field": "error message"
        }
    """

    message = "validation error"

    def validate(
        self,
        *,
        data,
        instance=None,
        context=None,
    ) -> dict:

        raise NotImplementedError

from apps.common.validations.rules.base_rule import BaseRule


class DateRangeRule(BaseRule):
    """
    start_date <= end_date
    """

    def validate(
        self,
        *,
        data,
        instance=None,
        context=None,
    ):

        errors = {}

        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if not start_date or not end_date:
            return errors

        if start_date > end_date:

            errors["end_date"] = "end_date must be greater than start_date"

        return errors

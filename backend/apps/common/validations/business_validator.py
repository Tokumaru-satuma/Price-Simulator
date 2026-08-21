from apps.common.validations.schemas import ValidationResult


class BusinessValidator:
    """
    Rule実行エンジン
    """

    def __init__(
        self,
        *,
        rules,
    ):
        self.rules = rules

    def validate(
        self,
        *,
        data,
        instance=None,
        context=None,
    ) -> ValidationResult:

        errors = {}

        for rule in self.rules:

            rule_errors = rule.validate(
                data=data,
                instance=instance,
                context=context,
            )

            if rule_errors:

                errors.update(rule_errors)

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
        )

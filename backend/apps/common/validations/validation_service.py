from apps.common.validations.business_validator import (
    BusinessValidator,
)

from apps.common.validations.rule_registry import RULES_MAP


class ValidationService:
    """
    Validation Service
    """

    @classmethod
    def validate(
        cls,
        *,
        model_name,
        data,
        instance=None,
        context=None,
    ):

        rules = RULES_MAP.get(
            model_name,
            [],
        )

        validator = BusinessValidator(
            rules=rules,
        )

        return validator.validate(
            data=data,
            instance=instance,
            context=context,
        )

class BusinessValidationError(Exception):
    """
    業務バリデーションエラー
    """

    def __init__(
        self,
        errors,
    ):
        self.errors = errors

        super().__init__(str(errors))

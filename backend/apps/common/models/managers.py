from django.db import models

from .querysets import ActiveQuerySet


class ActiveManager(models.Manager):

    def get_queryset(self):

        return ActiveQuerySet(
            self.model,
            using=self._db,
        ).filter(is_deleted=False)

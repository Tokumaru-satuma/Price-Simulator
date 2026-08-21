from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from .models import User


class UserCreationAdminForm(forms.ModelForm):
    """Django Adminでユーザーを追加するためのフォーム。"""

    password1 = forms.CharField(label="パスワード", widget=forms.PasswordInput)
    password2 = forms.CharField(label="パスワード（確認）", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "name",
            "role",
            "is_staff",
            "is_active",
        )

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("パスワードが一致しません。")

        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])

        if commit:
            user.save()

        return user


class UserChangeAdminForm(forms.ModelForm):
    """Django Adminでユーザーを変更するためのフォーム。"""

    password = ReadOnlyPasswordHashField(label="パスワード")

    class Meta:
        model = User
        fields = "__all__"

    def clean_password(self):
        return self.initial["password"]

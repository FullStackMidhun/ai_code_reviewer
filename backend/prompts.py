def get_prompt(code: str, language: str) -> str:
    return f"""You are a senior software engineer.
    Review the following {language} code and provide:

    1. Bugs or errors
    2. Optimization suggestions
    3. Code quality improvements
    4. Security issues (if any)
    5. Final rating out of 10

    Code:
    {code}
    """
